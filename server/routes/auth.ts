import { Hono } from 'hono';
import { currentActor } from '../lib/auth';

// Sign-in, sign-up, sign-out, password reset and token issuing are all served by Neon Auth.
// This proxy keeps them on the app's own origin, so the Neon session cookie is first-party,
// and then hands everything else to Neon unchanged. /me returns the app's own account row.
export const auth = new Hono();

const authBase = () => (process.env.NEON_AUTH_BASE_URL || '').replace(/\/$/, '');

// Headers that must not be forwarded in either direction.
const HOP_BY_HOP = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'transfer-encoding', 'keep-alive']);

auth.get('/me', async (c) => {
  const actor = await currentActor(c);
  if (!actor) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ user: actor });
});

auth.all('/*', async (c) => {
  const url = new URL(c.req.url);
  const target = `${authBase()}${url.pathname.replace(/^\/api\/auth/, '')}${url.search}`;

  const headers = new Headers();
  c.req.raw.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // Vercel and proxies add x-forwarded-* / x-vercel-* headers; Neon rejects the forwarded host.
    if (HOP_BY_HOP.has(k) || k.startsWith('x-forwarded-') || k.startsWith('x-vercel-') || k === 'forwarded') return;
    headers.set(key, value);
  });
  // Neon checks the origin against its trusted domains; send the app's own origin.
  headers.set('origin', url.origin);

  const hasBody = !['GET', 'HEAD'].includes(c.req.method);
  const upstream = await fetch(target, {
    method: c.req.method,
    headers,
    body: hasBody ? await c.req.raw.arrayBuffer() : undefined,
    redirect: 'manual',
  });

  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie' || HOP_BY_HOP.has(key.toLowerCase())) return;
    out.set(key, value);
  });
  // Set-Cookie can repeat, so copy each one separately.
  for (const cookie of upstream.headers.getSetCookie()) out.append('set-cookie', cookie);
  return new Response(upstream.body, { status: upstream.status, headers: out });
});
