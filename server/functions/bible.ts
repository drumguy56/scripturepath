import { svc } from '../lib/svc';
import { HttpError } from '../lib/records';

const PUBLIC_TRANSLATIONS = ['kjv', 'web', 'asv', 'bbe', 'ylt', 'darby'];

// bolls.life serves these translations with no key required.
const BOLLS_TRANSLATIONS = {
  esv: { code: 'ESV', name: 'English Standard Version' },
  bsb: { code: 'BSB', name: 'Berean Standard Bible' },
  nas: { code: 'NASB', name: 'New American Standard Bible' },
  amp: { code: 'AMP', name: 'Amplified Bible' },
  csb: { code: 'CSB17', name: 'Christian Standard Bible' },
  lsb: { code: 'LSB', name: 'Legacy Standard Bible' },
  net: { code: 'NET', name: 'New English Translation' },
  cev: { code: 'CEVD', name: 'Contemporary English Version' },
  gnt: { code: 'GNT', name: 'Good News Translation' },
  isr: { code: 'TS2009', name: 'The Scriptures' },
  isv: { code: 'ISV', name: 'International Standard Version' },
  erv: { code: 'ERV', name: 'Easy-to-Read Version' },
  drb: { code: 'DRB', name: 'Douay-Rheims Bible' },
  ara: { code: 'ARA', name: 'Almeida Revista e Atualizada' },
};

const BOOK_NUMBERS = new Map(
  [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
    'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
    'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
  ].map((name, index) => [name, index + 1])
);

const ALL_TRANSLATIONS = [
  ...PUBLIC_TRANSLATIONS,
  'nlt',
  'niv',
  ...Object.keys(BOLLS_TRANSLATIONS),
];

// USX book codes, in the same order as BOOK_NUMBERS below (used by API.Bible).
const NIV_OSIS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI',
  '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER',
  'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP',
  'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL',
  'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE',
  '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
];

let nivBibleId = null;

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

// Drops the inline footnote/heading markers (<sup>…</sup>) before flattening to plain text.
function cleanBollsText(text) {
  return toPlainText(
    String(text || '')
      .replace(/<b>[\s\S]*?<\/b>\s*(?=<br\s*\/?>)/gi, ' ')
      .replace(/<sup[\s\S]*?<\/sup>/gi, ' ')
  );
}

async function fetchBolls(translation, book, chapter) {
  const entry = BOLLS_TRANSLATIONS[translation];
  const number = BOOK_NUMBERS.get(book);
  if (!entry || !number) return null;

  const url = `https://bolls.life/get-chapter/${entry.code}/${number}/${chapter}/`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) }).catch(() => null);
  if (!res || !res.ok) return null;

  const list = await res.json().catch(() => null);
  if (!Array.isArray(list)) return null;

  const verses = list
    .map((item) => ({ verse: Number(item.verse), text: cleanBollsText(item.text) }))
    .filter((item) => item.text);

  if (verses.length === 0) return null;
  return { reference: `${book} ${chapter}`, translation: entry.name, verses };
}

async function resolveNivBibleId(key) {
  if (nivBibleId) return nivBibleId;
  const res = await fetch(
    'https://api.scripture.api.bible/v1/bibles?language=eng&include-full-details=false',
    { headers: { 'api-key': key }, signal: AbortSignal.timeout(12000) }
  ).catch(() => null);
  if (!res || !res.ok) return null;
  const data = await res.json().catch(() => null);
  const list = Array.isArray(data?.data) ? data.data : [];
  const match =
    list.find((item) => String(item.abbreviation || '').toUpperCase() === 'NIV') ||
    list.find((item) => /^NIV/i.test(String(item.abbreviation || '')));
  if (!match) return null;
  nivBibleId = match.id;
  return nivBibleId;
}

// API.Bible splits a verse into text nodes at line breaks (poetry) and inline markup, and the
// nodes carry no spacing of their own. Put a space back where two words would otherwise touch.
export function joinUsxText(prev, next) {
  if (!prev || !next) return prev + next;
  if (/\s$/.test(prev) || /^\s/.test(next)) return prev + next;
  if (/[\p{L}\p{N},;.:!?)”’"]$/u.test(prev) && /^[\p{L}\p{N}“‘"(]/u.test(next)) return prev + ' ' + next;
  return prev + next;
}

// API.Bible puts a stray space between stacked quote marks (“ ‘, ’ ”, ” ’). Close those gaps.
export function tidyNivQuotes(text) {
  return String(text || '')
    .replace(/“\s+‘/g, '“‘')
    .replace(/’\s+”/g, '’”')
    .replace(/”\s+’/g, '”’');
}

// Walks API.Bible's USX JSON, splitting text at each verse marker and dropping notes.
function readUsx(items, bucket) {
  for (const node of items || []) {
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'text') {
      if (bucket.current !== null) {
        bucket.text[bucket.current] = joinUsxText(bucket.text[bucket.current] || '', node.text || '');
      }
      continue;
    }
    if (node.name === 'verse' && node.attrs?.number) {
      bucket.current = String(node.attrs.number);
      if (bucket.text[bucket.current] === undefined) bucket.text[bucket.current] = '';
      continue;
    }
    if (node.name === 'note' || node.name === 'title') continue;
    if (Array.isArray(node.items)) readUsx(node.items, bucket);
  }
}

function parseNumberedText(text) {
  const clean = toPlainText(String(text || ''));
  const markers = [...clean.matchAll(/\[(\d+)\]/g)];
  if (markers.length === 0) return [];
  return markers
    .map((marker, index) => {
      const start = marker.index + marker[0].length;
      const end = index + 1 < markers.length ? markers[index + 1].index : clean.length;
      return { verse: Number(marker[1]), text: clean.slice(start, end).replace(/\s+/g, ' ').trim() };
    })
    .filter((item) => item.text);
}

async function fetchNiv(key, book, chapter) {
  const number = BOOK_NUMBERS.get(book);
  const osis = number ? NIV_OSIS[number - 1] : null;
  if (!osis) return null;

  const bibleId = await resolveNivBibleId(key);
  if (!bibleId) return null;

  const params =
    'content-type=json&include-notes=false&include-titles=false' +
    '&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false';
  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${osis}.${chapter}?${params}`;
  const res = await fetch(url, {
    headers: { 'api-key': key },
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (!res || !res.ok) return null;

  const data = await res.json().catch(() => null);
  const content = data?.data?.content;

  const bucket = { current: null, text: {} };
  if (Array.isArray(content)) readUsx(content, bucket);
  const verses = Object.keys(bucket.text)
    .map(Number)
    .sort((a, b) => a - b)
    .map((verse) => ({
      verse,
      text: tidyNivQuotes(String(bucket.text[String(verse)] || '').replace(/\s+/g, ' ').trim()),
    }))
    .filter((item) => item.text);

  if (verses.length === 0 || !data?.data?.reference) return null;
  return {
    reference: data.data.reference,
    translation: 'New International Version',
    verses,
  };
}

export async function getBibleChapter(_actor: unknown, body: Record<string, any>) {
    const book = String(body.book || '').trim();
    const chapter = Number(body.chapter);
    const translation = ALL_TRANSLATIONS.includes(body.translation) ? body.translation : 'kjv';

    if (!/^[1-3]?\s?[A-Za-z]{3,20}( of [A-Za-z]{3,20})?$/.test(book)) throw new HttpError(400, 'Unknown book');
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > 150) throw new HttpError(400, 'Invalid chapter');

    const cacheKey = `${translation}:${book}:${chapter}`;
    const cached = await svc.filter('BibleChapter', { cache_key: cacheKey }, { limit: 1 });
    if (cached.items.length > 0) return JSON.parse(String(cached.items[0].payload));

    let result: any = null;

    if (translation === 'nlt') {
      const parsed = await fetchNlt(book, chapter);
      if (parsed && parsed.verses.length > 0) {
        result = {
          reference: parsed.reference || `${book} ${chapter}`,
          translation: 'New Living Translation',
          verses: parsed.verses,
        };
      }
    } else if (translation === 'niv') {
      const key = process.env.API_BIBLE_KEY;
      if (!key) {
        throw new HttpError(400, 'NIV is licensed and needs an API.Bible key. Add your key to unlock it.');
      }
      result = await fetchNiv(key, book, chapter);
    } else if ((BOLLS_TRANSLATIONS as Record<string, unknown>)[translation]) {
      result = await fetchBolls(translation, book, chapter);
    } else {
      const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const data: any = await res.json();
        if (!data.error) {
          result = {
            reference: data.reference,
            translation: data.translation_name,
            verses: (data.verses || []).map((verse: any) => ({
              verse: verse.verse,
              text: verse.text.replace(/\s+/g, ' ').trim(),
            })),
          };
        }
      }
    }

    if (!result) throw new HttpError(404, 'That passage could not be found.');

    await svc
      .create('BibleChapter', {
        cache_key: cacheKey,
        translation: result.translation,
        book,
        chapter,
        reference: result.reference,
        payload: JSON.stringify(result),
      })
      .catch(() => null);

    return result;
}
