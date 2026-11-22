// Local production server with Bun: the API plus the built frontend from dist/.
// On Vercel the frontend is static and the API runs from api/[...route].ts instead.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { serveStatic } from 'hono/bun';
import { app } from './app';

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
  // Longest idle time Bun allows (AI replies can take a while).
  idleTimeout: 255,
};
