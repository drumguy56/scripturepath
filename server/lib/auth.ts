import { createHash, randomBytes, randomInt } from 'node:crypto';
import type { Context, Next } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { and, eq, gt } from 'drizzle-orm';
import { db, schema } from '../db';
import { HttpError } from './records';

export const SESSION_COOKIE = 'sp_session';
const SESSION_DAYS = 30;

export type Actor = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  verified: boolean;
};

export const isSecureUrl = () => (process.env.APP_URL || '').startsWith('https://');

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function sixDigitCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export async function createSession(c: Context, userId: string) {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(schema.sessions).values({ token_hash: sha256(token), user_id: userId, expires_at: expires });
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureUrl(),
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function endSession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.token_hash, sha256(token)));
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

// Resolves the signed-in user from the session cookie, or null.
export async function currentActor(c: Context): Promise<Actor | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const rows = await db
    .select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.user_id))
    .where(and(eq(schema.sessions.token_hash, sha256(token)), gt(schema.sessions.expires_at, new Date())))
    .limit(1);
  const user = rows[0]?.user;
  if (!user) return null;
  return toActor(user);
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
  if (!actor || !actor.verified) return c.json({ error: 'Unauthorized' }, 401);
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

// Failed sign-in throttle: 8 failures per email inside 15 minutes locks the email out.
const failures = new Map<string, number[]>();
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 8;

export function loginLocked(email: string) {
  const now = Date.now();
  const list = (failures.get(email) || []).filter((t) => now - t < WINDOW_MS);
  failures.set(email, list);
  return list.length >= MAX_FAILURES;
}

export function recordLoginFailure(email: string) {
  const list = failures.get(email) || [];
  list.push(Date.now());
  failures.set(email, list);
}

export function clearLoginFailures(email: string) {
  failures.delete(email);
}
