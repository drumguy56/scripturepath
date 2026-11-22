import { Hono } from 'hono';
import { getActor, requireActor } from '../lib/auth';
import { sealEntity } from '../lib/realtime';
import { HttpError, isEntityName } from '../lib/records';

// Issues a sealed live query for one entity, scoped to the caller. Sealed queries expire
// after about a minute; the browser asks again to renew.
export const realtime = new Hono();
realtime.use('*', requireActor);

realtime.post('/seal', async (c) => {
  const actor = getActor(c);
  const input = await c.req.json().catch(() => ({}));
  if (typeof input.entity !== 'string' || !isEntityName(input.entity)) throw new HttpError(404, 'Unknown entity');
  return c.json(await sealEntity(actor, input.entity));
});
