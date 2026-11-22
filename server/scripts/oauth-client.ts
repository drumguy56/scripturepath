// Operator tool for pre-approved OAuth clients. Run from the project root (reads .env).
//   bun server/scripts/oauth-client.ts create "Name" <redirect_uri> [more redirect_uris...] [--public]
//   bun server/scripts/oauth-client.ts list
//   bun server/scripts/oauth-client.ts revoke <client_id>
// `create` prints the client secret once. Confidential clients send it at the token endpoint;
// --public clients rely on PKCE alone.
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, client as sql, schema } from '../db';
import { randomToken, sha256 } from '../lib/auth';

const [command, ...rest] = process.argv.slice(2);

async function main() {
  if (command === 'create') {
    const isPublic = rest.includes('--public');
    const [name, ...uris] = rest.filter((a) => a !== '--public');
    if (!name || uris.length === 0) throw new Error('Usage: create "Name" <redirect_uri> [...] [--public]');
    for (const uri of uris) {
      const u = new URL(uri);
      if (u.protocol !== 'https:' && u.hostname !== 'localhost') throw new Error(`redirect_uri must be https: ${uri}`);
    }
    const clientId = `sp_${randomUUID()}`;
    const secret = isPublic ? null : randomToken(32);
    await db.insert(schema.oauthClients).values({
      client_id: clientId,
      name,
      secret_hash: secret ? sha256(secret) : null,
      redirect_uris: uris,
    });
    console.log(`client_id:     ${clientId}`);
    if (secret) console.log(`client_secret: ${secret}   (shown once, store it now)`);
    console.log(`redirect_uris: ${uris.join(', ')}`);
  } else if (command === 'list') {
    const rows = await db.select().from(schema.oauthClients);
    for (const r of rows) {
      console.log(`${r.client_id}  ${r.name}  ${r.secret_hash ? 'confidential' : 'public'}  ${r.redirect_uris.join(' ')}`);
    }
    if (rows.length === 0) console.log('No OAuth clients.');
  } else if (command === 'revoke') {
    const [clientId] = rest;
    if (!clientId) throw new Error('Usage: revoke <client_id>');
    // Deleting the client cascades to its codes and tokens.
    const gone = await db.delete(schema.oauthClients).where(eq(schema.oauthClients.client_id, clientId)).returning();
    console.log(gone.length ? `Revoked ${clientId} and its tokens.` : 'No such client.');
  } else {
    throw new Error('Commands: create | list | revoke');
  }
}

await main().finally(() => sql.end());
