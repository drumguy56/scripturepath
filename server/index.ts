import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { auth } from './routes/auth';
import { calendar } from './routes/calendar';
import { entities } from './routes/entities';
import { events } from './routes/events';
import { fn } from './routes/functions';
import { HttpError } from './lib/records';

const app = new Hono();

app.get('/api/health', (c) => c.json({ ok: true }));
app.route('/api/auth', auth);
app.route('/api/entities', entities);
app.route('/api/events', events);
app.route('/api/functions', fn);
app.route('/api/calendar', calendar);

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Not found' }, 404);
  return c.text('Not found', 404);
});

app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status as any);
  console.error(`${c.req.method} ${c.req.path} failed`, err);
  return c.json({ error: 'Something went wrong on the server' }, 500);
});

// In production the built frontend (dist/) is served from the same origin as the API.
const DIST = join(process.cwd(), 'dist');
if (existsSync(DIST)) {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', (c) => {
    if (c.req.path.startsWith('/api/')) return c.json({ error: 'Not found' }, 404);
    return new Response(Bun.file(join(DIST, 'index.html')));
  });
}

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
  // Longest idle time Bun allows. SSE sends a heartbeat well inside this window.
  idleTimeout: 255,
};
