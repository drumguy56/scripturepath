// The API as one Hono app. Runs under Bun locally (server/index.ts) and as a
// Vercel serverless function (api/[...route].ts). Keep runtime-specific code out of here.
import { Hono } from 'hono';
import { auth } from './routes/auth';
import { calendar } from './routes/calendar';
import { entities } from './routes/entities';
import { realtime } from './routes/realtime';
import { ai } from './routes/ai';
import { fn } from './routes/functions';
import { oauth } from './routes/oauth';
import { HttpError } from './lib/records';

export const app = new Hono();

app.get('/api/health', (c) => c.json({ ok: true }));
app.route('/api/auth', auth);
app.route('/api/entities', entities);
app.route('/api/realtime', realtime);
app.route('/api/ai', ai);
app.route('/api/functions', fn);
app.route('/api/calendar', calendar);
app.route('/api/oauth', oauth);

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Not found' }, 404);
  return c.text('Not found', 404);
});

app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status as any);
  console.error(`${c.req.method} ${c.req.path} failed`, err);
  return c.json({ error: 'Something went wrong on the server' }, 500);
});

export default app;
