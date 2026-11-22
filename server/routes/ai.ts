import { Hono } from 'hono';
import { getActor, requireActor } from '../lib/auth';
import { getRecord, HttpError } from '../lib/records';

// Chat through the Neon AI Gateway (OpenAI-compatible). Signed-in users only.
// The gateway token stays on the server; the browser never sees it.
export const ai = new Hono();
ai.use('*', requireActor);

const DEFAULT_MODEL = process.env.NEON_AI_MODEL || 'claude-opus-4-8';
const MAX_HISTORY = 20;
const MAX_CHARS = 4000;

type Msg = { role: 'user' | 'assistant'; content: string };

function parseHistory(raw: unknown): Msg[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(400, 'messages is required');
  const msgs = raw.slice(-MAX_HISTORY).map((m: any) => {
    if (!['user', 'assistant'].includes(m?.role) || typeof m.content !== 'string') {
      throw new HttpError(400, 'Each message needs a role and text content');
    }
    if (m.content.length > MAX_CHARS) throw new HttpError(400, 'Message too long');
    return { role: m.role as Msg['role'], content: m.content };
  });
  if (msgs[msgs.length - 1].role !== 'user') throw new HttpError(400, 'The last message must be from the user');
  return msgs;
}

async function callGateway(messages: { role: string; content: string }[]) {
  const base = process.env.NEON_AI_GATEWAY_BASE_URL;
  const token = process.env.NEON_AI_GATEWAY_TOKEN;
  if (!base || !token) throw new HttpError(503, 'AI is not configured');

  const res = await fetch(`${base.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: DEFAULT_MODEL, messages, max_tokens: 900 }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) {
    console.error('AI gateway error', res.status, data);
    if (res.status === 429) throw new HttpError(429, 'The AI daily limit has been reached. Try again after it resets.');
    throw new HttpError(502, 'The AI request failed. Try again in a moment.');
  }
  return { reply: (data.choices?.[0]?.message?.content ?? '') as string, model: data.model as string };
}

// Study companion: answers questions about one lesson of one study. The system prompt is
// built here from the database record, so the browser only names the study and lesson.
ai.post('/study-chat', async (c) => {
  getActor(c);
  const input = await c.req.json().catch(() => ({}));
  const study = await getRecord('Study', String(input.studyId || ''));
  const lesson = await getRecord('Lesson', String(input.lessonId || ''));
  if (!study || !lesson || lesson.study_id !== study.id) throw new HttpError(404, 'Lesson not found');

  const system = [
    `You are a study companion for the ScripturePath study "${study.title}".`,
    `Current lesson ${lesson.order}: "${lesson.title}" (${lesson.scripture_reference}).`,
    'Answer questions about this lesson. Ground answers in the scripture text and teaching below.',
    'Quote the Bible only from the scripture text given. If a question goes beyond it, say so plainly.',
    'Keep answers short and plain. Do not invent verses or facts.',
    '',
    `Scripture text:\n${lesson.scripture_text || ''}`,
    '',
    `Lesson teaching:\n${lesson.teaching || ''}`,
  ].join('\n');

  const history = parseHistory(input.messages);
  const { reply, model } = await callGateway([{ role: 'system', content: system }, ...history]);
  return c.json({ reply, model });
});
