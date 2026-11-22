import { createHash, randomBytes } from 'node:crypto';
import type { Context, Next } from 'hono';
import { eq } from 'drizzle-orm';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { db, schema } from '../db';
import { HttpError } from './records';

// Accounts and sign-in are handled by Neon Auth (managed Better Auth). The browser signs in
// through this server's /api/auth proxy, then sends a short-lived Neon Auth JWT as
// `Authorization: Bearer`. Requests that only carry the Neon session cookie (page navigations,
// the SSE stream, the Google Calendar popup) are exchanged for a JWT server-side first.

export type Actor = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  verified: boolean;
};

const authBase = () => (process.env.NEON_AUTH_BASE_URL || '').replace(/\/$/, '');
const adminEmail = () => (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export const isSecureUrl = () => (process.env.APP_URL || '').startsWith('https://');

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function keySet() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!));
  return jwks;
}

// Neon Auth issues tokens whose issuer and audience are the origin of the auth base URL.
async function verifyJwt(token: string): Promise<JWTPayload | null> {
  const issuer = new URL(authBase()).origin;
  try {
    const { payload } = await jwtVerify(token, keySet(), { issuer, audience: issuer });
    return payload;
  } catch {
    return null;
  }
}

// Exchanges the Neon Auth session cookie for a JWT. Null when the cookie is absent or stale.
async function jwtFromCookie(c: Context): Promise<string | null> {
  const cookie = c.req.header('cookie');
  if (!cookie || !cookie.includes('neon-auth')) return null;
  const origin = new URL(c.req.url).origin;
  const res = await fetch(`${authBase()}/token`, { headers: { cookie, origin } }).catch(() => null);
  if (!res || !res.ok) return null;
  const body = (await res.json().catch(() => null)) as { token?: string } | null;
  return body?.token ?? null;
}

// Creates the app's account row the first time a Neon Auth user signs in, and keeps the
// name and email in step with Neon Auth. Admin status follows ADMIN_EMAIL.
async function syncUser(claims: JWTPayload): Promise<Actor> {
  const id = String(claims.sub);
  const email = String(claims.email ?? '').trim().toLowerCase();
  const name = String(claims.name ?? '').trim().slice(0, 120);
  const isAdmin = email === adminEmail();

  const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (existing) {
    const wantRole = isAdmin && existing.role !== 'admin' ? 'admin' : existing.role;
    if (existing.email !== email || existing.full_name !== name || wantRole !== existing.role) {
      const [row] = await db
        .update(schema.users)
        .set({ email, full_name: name || existing.full_name, role: wantRole, updated_date: new Date() })
        .where(eq(schema.users.id, id))
        .returning();
      return toActor(row);
    }
    return toActor(existing);
  }

  const [created] = await db
    .insert(schema.users)
    .values({ id, email, full_name: name, role: isAdmin ? 'admin' : 'user', verified: true })
    .returning();
  if (!isAdmin && adminEmail()) {
    const { newMemberEmail, sendMail } = await import('./mail');
    const mail = newMemberEmail({
      name: created.full_name || created.email,
      email: created.email,
      joinedAt: new Date().toUTCString(),
    });
    sendMail({ to: adminEmail(), ...mail }).catch((err) => console.error('admin alert failed', err));
  }
  return toActor(created);
}

// The signed-in user, or null. Checks a Bearer JWT first, then the Neon Auth session cookie.
export async function currentActor(c: Context): Promise<Actor | null> {
  const header = c.req.header('authorization') || '';
  const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  let claims = bearer ? await verifyJwt(bearer) : null;
  if (!claims) {
    const token = await jwtFromCookie(c);
    claims = token ? await verifyJwt(token) : null;
  }
  if (!claims?.sub || !claims.email) return null;
  return syncUser(claims);
}

export function toActor(user: typeof schema.users.$inferSelect): Actor {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    verified: user.verified,
  };
}

export async function requireActor(c: Context, next: Next) {
  const actor = await currentActor(c);
  if (!actor) return c.json({ error: 'Unauthorized' }, 401);
  c.set('actor', actor);
  await next();
}

export function getActor(c: Context): Actor {
  const actor = c.get('actor') as Actor | undefined;
  if (!actor) throw new HttpError(401, 'Unauthorized');
  return actor;
}

export function requireAdmin(actor: Actor) {
  if (actor.role !== 'admin') throw new HttpError(403, 'Forbidden');
}

export function displayName(actor: Actor) {
  return actor.full_name || actor.email || 'Member';
}
