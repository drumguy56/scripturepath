import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const PUBLIC_TRANSLATIONS = ['kjv', 'web', 'asv', 'bbe'];
const ALL_TRANSLATIONS = [...PUBLIC_TRANSLATIONS, 'nlt'];

const NLT_BOOK_ALIASES = {
  'Song of Solomon': 'Song of Songs',
};

// Drops the nested footnote spans (<span class="tn"> … </span>) the NLT API embeds.
function stripFootnotes(html) {
  let out = '';
  let index = 0;
  while (index < html.length) {
    const start = html.indexOf('<span class="tn">', index);
    if (start === -1) {
      out += html.slice(index);
      break;
    }
    out += html.slice(index, start);
    let depth = 0;
    let cursor = start;
    while (cursor < html.length) {
      const open = html.indexOf('<span', cursor);
      const close = html.indexOf('</span>', cursor);
      if (close === -1) {
        cursor = html.length;
        break;
      }
      if (open !== -1 && open < close) {
        depth += 1;
        cursor = open + 5;
      } else {
        depth -= 1;
        cursor = close + 7;
        if (depth === 0) break;
      }
    }
    index = cursor;
  }
  return out;
}

function toPlainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNlt(html) {
  const heading = html.match(/<h2 class="bk_ch_vs_header">([^<]+)<\/h2>/);
  const reference = heading ? heading[1].split(',')[0].trim() : '';

  const body = html
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ')
    .replace(/<a class="a-tn">[\s\S]*?<\/a>/gi, ' ');
  const clean = stripFootnotes(body);

  const marker = /<span class="vn">(\d+)<\/span>/g;
  const matches = [...clean.matchAll(marker)];
  const verses = [];

  matches.forEach((match, position) => {
    const start = match.index + match[0].length;
    const end = position + 1 < matches.length ? matches[position + 1].index : clean.length;
    const text = toPlainText(clean.slice(start, end));
    if (text) verses.push({ verse: Number(match[1]), text });
  });

  return { reference, verses };
}

async function fetchNlt(book, chapter) {
  const name = NLT_BOOK_ALIASES[book] || book;
  const url = `https://api.nlt.to/api/passages?ref=${encodeURIComponent(
    `${name}.${chapter}`
  )}&version=NLT&key=TEST`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return null;
  const html = await res.text();
  if (!html.includes('bk_ch_vs_header')) return null;
  return parseNlt(html);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const book = String(body.book || '').trim();
    const chapter = Number(body.chapter);
    const translation = ALL_TRANSLATIONS.includes(body.translation) ? body.translation : 'kjv';

    if (!/^[1-3]?\s?[A-Za-z]{3,20}( of [A-Za-z]{3,20})?$/.test(book)) {
      return Response.json({ error: 'Unknown book' }, { status: 400 });
    }
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > 150) {
      return Response.json({ error: 'Invalid chapter' }, { status: 400 });
    }

    const cacheKey = `${translation}:${book}:${chapter}`;
    const cached = await base44.asServiceRole.entities.BibleChapter.filter(
      { cache_key: cacheKey },
      { limit: 1 }
    );
    if (cached.items.length > 0) {
      return Response.json(JSON.parse(cached.items[0].payload));
    }

    let result = null;

    if (translation === 'nlt') {
      const parsed = await fetchNlt(book, chapter);
      if (parsed && parsed.verses.length > 0) {
        result = {
          reference: parsed.reference || `${book} ${chapter}`,
          translation: 'New Living Translation',
          verses: parsed.verses,
        };
      }
    } else {
      const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const data = await res.json();
        if (!data.error) {
          result = {
            reference: data.reference,
            translation: data.translation_name,
            verses: (data.verses || []).map((verse) => ({
              verse: verse.verse,
              text: verse.text.replace(/\s+/g, ' ').trim(),
            })),
          };
        }
      }
    }

    if (!result) {
      return Response.json({ error: 'That passage could not be found.' }, { status: 404 });
    }

    await base44.asServiceRole.entities.BibleChapter.create({
      cache_key: cacheKey,
      translation: result.translation,
      book,
      chapter,
      reference: result.reference,
      payload: JSON.stringify(result),
    }).catch(() => null);

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}