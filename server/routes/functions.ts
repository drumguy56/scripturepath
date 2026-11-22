import { Hono } from 'hono';
import { getActor, requireActor } from '../lib/auth';
import { HttpError } from '../lib/records';
import { functions } from '../functions';

// Named server functions the frontend calls through the client's functions.invoke().
export const fn = new Hono();

fn.post('/:name', requireActor, async (c) => {
  const handler = functions[c.req.param('name')];
  if (!handler) throw new HttpError(404, 'Unknown function');
  const parsed = await c.req.json().catch(() => ({}));
  const body = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  const data = await handler(getActor(c), body);
  return c.json(data ?? {});
});
