import { Hono } from 'hono';
import { currentActor, sha256 } from '../lib/auth';
import { HttpError } from '../lib/records';
import { svc } from '../lib/svc';
import {
  consumeCode,
  findClient,
  issueCode,
  issueToken,
  parseScope,
  pkceMatches,
  redirectAllowed,
  tokenFromRequest,
  type ClientRow,
} from '../lib/oauth';

export const oauth = new Hono();

type AuthParams = {
  client: ClientRow;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
};

// Validates an authorization request. Errors that cannot be sent back to the client's
// redirect_uri (unknown client, unregistered redirect) are thrown as 400s, never redirected.
async function validateAuthorize(p: Record<string, string | undefined>): Promise<AuthParams> {
  const clientId = p.client_id || '';
  const client = clientId ? await findClient(clientId) : null;
  if (!client) throw new HttpError(400, 'Unknown client');
  const redirectUri = p.redirect_uri || '';
  if (!redirectAllowed(client, redirectUri)) throw new HttpError(400, 'redirect_uri is not registered for this client');
  if (p.response_type !== 'code') throw new HttpError(400, 'response_type must be "code"');
  const scope = parseScope(p.scope || '');
  if (!scope) throw new HttpError(400, 'Unsupported or missing scope');
  if (!p.code_challenge || p.code_challenge_method !== 'S256') {
    throw new HttpError(400, 'PKCE is required: code_challenge with code_challenge_method=S256');
  }
  return { client, redirectUri, scope, state: p.state || '', codeChallenge: p.code_challenge };
}

// What the consent screen shows. Requires a signed-in session.
oauth.get('/authorize-info', async (c) => {
  const actor = await currentActor(c);
  if (!actor || !actor.verified) throw new HttpError(401, 'Sign in first');
  const req = await validateAuthorize(c.req.query());
  return c.json({
    client_name: req.client.name,
    scope: req.scope,
    user_email: actor.email,
    is_admin: actor.role === 'admin',
  });
});

// Approve or deny. Only admins may approve; the grant is for the approving admin's data.
oauth.post('/decision', async (c) => {
  const actor = await currentActor(c);
  if (!actor || !actor.verified) throw new HttpError(401, 'Sign in first');
  const body = await c.req.json().catch(() => ({}));
  const req = await validateAuthorize(body);
  const approve = body.decision === 'approve';

  const target = new URL(req.redirectUri);
  if (!approve) {
    target.searchParams.set('error', 'access_denied');
  } else {
    if (actor.role !== 'admin') throw new HttpError(403, 'Only admins can approve connections');
    const code = await issueCode({
      clientId: req.client.client_id,
      userId: actor.id,
      redirectUri: req.redirectUri,
      scope: req.scope,
      codeChallenge: req.codeChallenge,
    });
    target.searchParams.set('code', code);
  }
  if (req.state) target.searchParams.set('state', req.state);
  return c.json({ redirect: target.toString() });
});

// Token endpoint: exchanges a code (with its PKCE verifier) for an access token.
oauth.post('/token', async (c) => {
  const contentType = c.req.header('content-type') || '';
  const form: Record<string, string> = contentType.includes('application/json')
    ? await c.req.json().catch(() => ({}))
    : Object.fromEntries(Object.entries(await c.req.parseBody()).map(([k, v]) => [k, String(v)]));

  const fail = (error: string, status: 400 | 401 = 400) => c.json({ error }, status);
  if (form.grant_type !== 'authorization_code') return fail('unsupported_grant_type');

  const client = form.client_id ? await findClient(form.client_id) : null;
  if (!client) return fail('invalid_client', 401);
  if (client.secret_hash && sha256(form.client_secret || '') !== client.secret_hash) {
    return fail('invalid_client', 401);
  }

  const code = await consumeCode(form.code || '');
  if (!code || code.client_id !== client.client_id) return fail('invalid_grant');
  if (code.redirect_uri !== form.redirect_uri) return fail('invalid_grant');
  if (!form.code_verifier || !pkceMatches(form.code_verifier, code.code_challenge)) return fail('invalid_grant');

  const { token, expiresIn } = await issueToken(client.client_id, code.user_id, code.scope);
  c.header('Cache-Control', 'no-store');
  return c.json({ access_token: token, token_type: 'Bearer', expires_in: expiresIn, scope: code.scope });
});

// Protected resource: the granted user's studies and study progress.
oauth.get('/v1/studies-progress', async (c) => {
  const row = await tokenFromRequest(c.req.header('authorization'));
  if (!row) return c.json({ error: 'invalid_token' }, 401);
  if (!row.scope.split(' ').includes('studies:read')) return c.json({ error: 'insufficient_scope' }, 403);
  const [studies, progress] = await Promise.all([
    svc.list('Study', { sort: 'created_date' }),
    svc.filter('StudyProgress', { created_by_id: row.user_id }, { limit: 1000 }),
  ]);
  return c.json({ studies, progress: progress.items });
});
