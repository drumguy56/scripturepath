import { createHash } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { db, schema } from '../db';
import { randomToken, sha256 } from './auth';

// The only scope this server grants: read the signed-in admin's studies and study progress.
export const SCOPES = ['studies:read'] as const;
export const CODE_MINUTES = 5;
export const TOKEN_MINUTES = 60;

export type ClientRow = typeof schema.oauthClients.$inferSelect;

export async function findClient(clientId: string): Promise<ClientRow | null> {
  const rows = await db.select().from(schema.oauthClients).where(eq(schema.oauthClients.client_id, clientId)).limit(1);
  return rows[0] ?? null;
}

// Exact string match against the registered list. No wildcards, no prefix matching.
export function redirectAllowed(client: ClientRow, redirectUri: string) {
  return client.redirect_uris.includes(redirectUri);
}

// Returns the requested scopes if every one is supported, otherwise null.
export function parseScope(scope: string): string | null {
  const wanted = scope.split(' ').filter(Boolean);
  if (wanted.length === 0) return null;
  return wanted.every((s) => (SCOPES as readonly string[]).includes(s)) ? wanted.join(' ') : null;
}

// PKCE S256: BASE64URL(SHA256(verifier)) must equal the challenge stored with the code.
export function pkceMatches(verifier: string, challenge: string) {
  const computed = createHash('sha256').update(verifier).digest('base64url');
  return computed === challenge;
}

export async function issueCode(args: {
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  codeChallenge: string;
}): Promise<string> {
  const code = randomToken();
  await db.insert(schema.oauthCodes).values({
    code_hash: sha256(code),
    client_id: args.clientId,
    user_id: args.userId,
    redirect_uri: args.redirectUri,
    scope: args.scope,
    code_challenge: args.codeChallenge,
    expires_at: new Date(Date.now() + CODE_MINUTES * 60_000),
  });
  return code;
}

// Consumes a code atomically: a code can be exchanged once, even under concurrent requests.
export async function consumeCode(code: string) {
  const rows = await db
    .delete(schema.oauthCodes)
    .where(and(eq(schema.oauthCodes.code_hash, sha256(code)), gt(schema.oauthCodes.expires_at, new Date())))
    .returning();
  return rows[0] ?? null;
}

export async function issueToken(clientId: string, userId: string, scope: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + TOKEN_MINUTES * 60_000);
  await db.insert(schema.oauthTokens).values({
    token_hash: sha256(token),
    client_id: clientId,
    user_id: userId,
    scope,
    expires_at: expiresAt,
  });
  return { token, expiresIn: TOKEN_MINUTES * 60 };
}

// Resolves a bearer token to its user and granted scope, or null.
export async function tokenFromRequest(authHeader: string | undefined) {
  const match = /^Bearer\s+(.+)$/i.exec(authHeader || '');
  if (!match) return null;
  const rows = await db
    .select()
    .from(schema.oauthTokens)
    .where(and(eq(schema.oauthTokens.token_hash, sha256(match[1])), gt(schema.oauthTokens.expires_at, new Date())))
    .limit(1);
  return rows[0] ?? null;
}
