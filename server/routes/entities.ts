import { Hono } from 'hono';
import { getActor, requireActor, requireAdmin } from '../lib/auth';
import { canRead, isAdminOnlyWrite, prepareCreate, readScope, sanitizePatch, writeScope } from '../lib/policy';
import {
  HttpError,
  countRecords,
  createRecord,
  deleteRecord,
  getRecord,
  isEntityName,
  queryRecords,
  updateRecord,
  type EntityName,
} from '../lib/records';

export const entities = new Hono();
entities.use('*', requireActor);

// Parses the entity name in the path, or 404s for anything that is not a known entity.
function entityOf(name: string): EntityName {
  if (!isEntityName(name)) throw new HttpError(404, 'Unknown entity');
  return name;
}

async function body(c: any): Promise<Record<string, any>> {
  const value = await c.req.json().catch(() => null);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'A JSON object is required');
  return value;
}

entities.post('/:entity/query', async (c) => {
  const actor = getActor(c);
  const entity = entityOf(c.req.param('entity'));
  const input = await c.req.json().catch(() => ({}));
  const items = await queryRecords({
    entity,
    filter: input.filter && typeof input.filter === 'object' ? input.filter : {},
    sort: typeof input.sort === 'string' ? input.sort : undefined,
    limit: typeof input.limit === 'number' ? input.limit : Number(input.limit) || undefined,
    scope: readScope(actor, entity),
  });
  return c.json({ items });
});

entities.post('/:entity/count', async (c) => {
  const actor = getActor(c);
  const entity = entityOf(c.req.param('entity'));
  const input = await c.req.json().catch(() => ({}));
  const count = await countRecords(entity, input.filter && typeof input.filter === 'object' ? input.filter : {}, readScope(actor, entity));
  return c.json({ count });
});

entities.get('/:entity/:id', async (c) => {
  const actor = getActor(c);
  const entity = entityOf(c.req.param('entity'));
  const rec = await getRecord(entity, c.req.param('id'), readScope(actor, entity));
  if (!rec) return c.json({ error: 'Not found' }, 404);
  return c.json(rec);
});

entities.post('/:entity', async (c) => {
  const actor = getActor(c);
  const entity = entityOf(c.req.param('entity'));
  if (isAdminOnlyWrite(entity)) requireAdmin(actor);
  const data = await prepareCreate(actor, entity, await body(c));
  const rec = await createRecord(entity, data, actor.id);
  return c.json(rec, 201);
});

entities.patch('/:entity/:id', async (c) => {
  const actor = getActor(c);
  const entity = entityOf(c.req.param('entity'));
  if (isAdminOnlyWrite(entity)) requireAdmin(actor);
  const patch = sanitizePatch(entity, await body(c), actor);
  const scope = isAdminOnlyWrite(entity) ? undefined : writeScope(actor, entity);
  const rec = await updateRecord(entity, c.req.param('id'), patch, scope);
  if (!rec) return c.json({ error: 'Not found' }, 404);
  return c.json(rec);
});

entities.delete('/:entity/:id', async (c) => {
  const actor = getActor(c);
  const entity = entityOf(c.req.param('entity'));
  if (isAdminOnlyWrite(entity)) requireAdmin(actor);
  const scope = isAdminOnlyWrite(entity) ? undefined : writeScope(actor, entity);
  const ok = await deleteRecord(entity, c.req.param('id'), scope);
  if (!ok) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export { canRead };
