import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const TRANSLATIONS = ['kjv', 'web', 'asv'];

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
    const translation = TRANSLATIONS.includes(body.translation) ? body.translation : 'kjv';

    if (!/^[1-3]?\s?[A-Za-z]{3,20}( of [A-Za-z]{3,20})?$/.test(book)) {
      return Response.json({ error: 'Unknown book' }, { status: 400 });
    }
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > 150) {
      return Response.json({ error: 'Invalid chapter' }, { status: 400 });
    }

    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return Response.json({ error: 'That passage could not be found.' }, { status: 404 });
    }

    const data = await res.json();
    if (data.error) {
      return Response.json({ error: 'That passage could not be found.' }, { status: 404 });
    }

    return Response.json({
      reference: data.reference,
      translation: data.translation_name,
      verses: (data.verses || []).map((verse) => ({
        verse: verse.verse,
        text: verse.text.replace(/\s+/g, ' ').trim(),
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}