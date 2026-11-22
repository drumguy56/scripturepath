import { createRealtime, rawSql } from '@neon/realtime/server';
import type { Actor } from './auth';
import { readScope } from './policy';
import type { EntityName } from './records';

// Neon Realtime: each signed-in browser subscribes to a sealed live query per entity. The
// query is the same visibility rule the REST API applies (readScope), so a row reaches a
// user only while the query matches it. Revoked membership drops rows live, too.
const databaseName = new URL(process.env.DATABASE_URL!).pathname.slice(1) || 'neondb';

export const UNSCOPED_LIVE_LIMIT = 500;

export const realtime = createRealtime({
  secret: process.env.NEON_REALTIME_SECRET!,
  db: databaseName,
});

export function entityLiveQuery(actor: Actor, entity: EntityName) {
  const params: unknown[] = [entity];
  const scope = readScope(actor, entity);
  const extra = scope ? scope(params) : null;
  // Unscoped entities (public curriculum, Bible cache, admin views) are shared by everyone,
  // so cap the live result: a full table snapshot would be pushed to every browser.
  const sql =
    'SELECT id, created_by_id, data, created_date, updated_date FROM records WHERE entity = $1' +
    (extra ? ` AND (${extra})` : '') +
    (extra ? '' : ` ORDER BY created_date DESC, id DESC LIMIT ${UNSCOPED_LIVE_LIMIT}`);
  return rawSql<{ id: string; created_by_id: string | null; data: Record<string, unknown>; created_date: Date; updated_date: Date }>(sql, params);
}

export function sealEntity(actor: Actor, entity: EntityName) {
  return realtime.seal({ query: entityLiveQuery(actor, entity) });
}
