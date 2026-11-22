// Google Calendar OAuth: consent URL, code exchange, and token refresh for one user.
import { and, eq } from 'drizzle-orm';
import { db, schema } from '../db';

export const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.events';

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.APP_URL);
}

export function redirectUri() {
  return `${(process.env.APP_URL || '').replace(/\/$/, '')}/api/calendar/callback`;
}

export function consentUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: GOOGLE_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

type TokenResponse = { access_token: string; expires_in: number; refresh_token?: string; error?: string };

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      ...body,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const data = (await res.json().catch(() => ({}))) as TokenResponse;
  return { ok: res.ok, data };
}

export async function exchangeCode(code: string, userId: string) {
  const { ok, data } = await tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: redirectUri() });
  if (!ok || !data.access_token || !data.refresh_token) throw new Error('Google did not grant calendar access');
  await db
    .insert(schema.calendarConnections)
    .values({
      user_id: userId,
      provider: 'google',
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000),
    })
    .onConflictDoUpdate({
      target: [schema.calendarConnections.user_id, schema.calendarConnections.provider],
      set: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000),
      },
    });
}

// Returns a usable access token for the user, refreshing it when close to expiry.
// Returns null when the user has not connected, or revoked access at Google.
export async function getAccessToken(userId: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(schema.calendarConnections)
    .where(and(eq(schema.calendarConnections.user_id, userId), eq(schema.calendarConnections.provider, 'google')))
    .limit(1);
  if (!row) return null;
  if (row.expires_at.getTime() - Date.now() > 60_000) return row.access_token;

  const { ok, data } = await tokenRequest({ refresh_token: row.refresh_token, grant_type: 'refresh_token' });
  if (!ok || !data.access_token) {
    await disconnectGoogle(userId);
    return null;
  }
  await db
    .update(schema.calendarConnections)
    .set({
      access_token: data.access_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000),
    })
    .where(and(eq(schema.calendarConnections.user_id, userId), eq(schema.calendarConnections.provider, 'google')));
  return data.access_token;
}

export async function disconnectGoogle(userId: string) {
  await db
    .delete(schema.calendarConnections)
    .where(and(eq(schema.calendarConnections.user_id, userId), eq(schema.calendarConnections.provider, 'google')));
}
