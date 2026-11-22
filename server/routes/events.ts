import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { getActor, requireActor } from '../lib/auth';
import { subscribe, type ChangeEvent } from '../lib/bus';
import { canRead } from '../lib/policy';
import { isEntityName } from '../lib/records';

// Live feed for the browser. One stream per tab; each change is sent only to users
// allowed to read that record. Clients reconnect automatically if the stream drops.
export const events = new Hono();

const HEARTBEAT_MS = 20_000;

events.get('/', requireActor, (c) => {
  const actor = getActor(c);

  return streamSSE(c, async (stream) => {
    let chain: Promise<void> = Promise.resolve();
    let closed = false;

    const unsubscribe = subscribe((event: ChangeEvent) => {
      if (closed || !isEntityName(event.entity)) return;
      // Serialise deliveries so the stream keeps its order even with async permission checks.
      chain = chain
        .then(async () => {
          if (closed) return;
          if (!(await canRead(actor, event.entity as any, event.data))) return;
          await stream.writeSSE({
            data: JSON.stringify({ type: event.type, entity: event.entity, id: event.id, data: event.data }),
          });
        })
        .catch((err) => console.error('sse delivery failed', err));
    });

    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: 'ping', data: '' }).catch(() => {});
    }, HEARTBEAT_MS);

    await new Promise<void>((resolve) => {
      stream.onAbort(() => {
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        resolve();
      });
    });
  });
});
