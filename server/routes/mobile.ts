import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

// Sign-in for the native app. The web app keeps Neon Auth's session in an HttpOnly cookie, which a
// phone app cannot read from JavaScript. These routes forward to Neon Auth on the server, keep the
// session cookie, and hand the app a short-lived JWT for `Authorization: Bearer`. The app stores
// the session value in the device's secure storage and uses it to renew the JWT.
export const mobile = new Hono();

const authBase = () => (process.env.NEON_AUTH_BASE_URL || '').replace(/\/$/, '');
const COOKIE_RE = /((?:__Secure-)?neon-auth\.session_token)=([^;]+)/;

function sessionFrom(setCookies: string[]): string | null {
  for (const header of setCookies) {
    const match = header.match(COOKIE_RE);
    if (match) return `${match[1]}=${match[2]}`;
  }
  return null;
}

function isSession(value: unknown): value is string {
  return typeof value === 'string' && COOKIE_RE.test(value);
}

// Exchanges a session cookie for a JWT. Neon may rotate the session, so the new cookie is returned too.
async function exchange(session: string): Promise<{ token: string; session: string } | null> {
  const res = await fetch(`${authBase()}/token`, { headers: { cookie: session } }).catch(() => null);
  if (!res || !res.ok) return null;
  const body = (await res.json().catch(() => null)) as { token?: string } | null;
  if (!body?.token) return null;
  const rotated = sessionFrom(res.headers.getSetCookie());
  return { token: body.token, session: rotated ?? session };
}

async function forward(path: string, body: unknown, origin: string, cookie?: string) {
  const headers: Record<string, string> = { 'content-type': 'application/json', origin };
  if (cookie) headers.cookie = cookie;
  return fetch(`${authBase()}${path}`, { method: 'POST', headers, body: JSON.stringify(body), redirect: 'manual' });
}

// Runs an upstream Neon Auth sign-in/sign-up and turns its Set-Cookie into a JWT + session for the app.
async function startSession(upstream: Response, fallbackError: string) {
  if (!upstream.ok) {
    const body = (await upstream.json().catch(() => ({}))) as { message?: string };
    const status = upstream.status >= 400 && upstream.status < 500 ? (upstream.status as ContentfulStatusCode) : 400;
    return { status, body: { error: body.message || fallbackError } };
  }
  const payload = (await upstream.json().catch(() => ({}))) as { user?: unknown };
  const cookie = sessionFrom(upstream.headers.getSetCookie());
  if (!cookie) return { status: 502 as ContentfulStatusCode, body: { error: 'Sign-in could not be completed. Try again.' } };
  const issued = await exchange(cookie);
  if (!issued) return { status: 502 as ContentfulStatusCode, body: { error: 'Sign-in could not be completed. Try again.' } };
  return { status: 200 as ContentfulStatusCode, body: { token: issued.token, session: issued.session, user: payload.user ?? null } };
}

mobile.post('/sign-in', async (c) => {
  const input = (await c.req.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!input?.email || !input?.password) return c.json({ error: 'Email and password are required.' }, 400);
  const upstream = await forward('/sign-in/email', { email: input.email, password: input.password }, new URL(c.req.url).origin);
  const out = await startSession(upstream, 'Invalid email or password.');
  return c.json(out.body, out.status);
});

mobile.post('/sign-up', async (c) => {
  const input = (await c.req.json().catch(() => null)) as { email?: string; password?: string; name?: string } | null;
  if (!input?.email || !input?.password || !input?.name) {
    return c.json({ error: 'Name, email and password are required.' }, 400);
  }
  const upstream = await forward(
    '/sign-up/email',
    { email: input.email, password: input.password, name: input.name },
    new URL(c.req.url).origin
  );
  const out = await startSession(upstream, 'Could not create the account.');
  return c.json(out.body, out.status);
});

// Renews the JWT from the stored session. Returns the session again in case Neon rotated it.
mobile.post('/token', async (c) => {
  const input = (await c.req.json().catch(() => null)) as { session?: unknown } | null;
  if (!isSession(input?.session)) return c.json({ error: 'Unauthorized' }, 401);
  const issued = await exchange(input.session);
  if (!issued) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ token: issued.token, session: issued.session });
});

mobile.post('/sign-out', async (c) => {
  const input = (await c.req.json().catch(() => null)) as { session?: unknown } | null;
  if (isSession(input?.session)) {
    await forward('/sign-out', {}, new URL(c.req.url).origin, input.session).catch(() => null);
  }
  return c.json({ ok: true });
});
