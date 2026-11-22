import { randomUUID } from 'node:crypto';
import { client } from '../db';

// Entities stored as rows in the `records` table. Their fields live in `data` (jsonb).
export const ENTITY_NAMES = [
  'Study',
  'Lesson',
  'StudyGroup',
  'StudyProgress',
  'JournalEntry',
  'GroupMessage',
  'LessonComment',
  'SessionAttendance',
  'SessionEvent',
  'BibleChapter',
] as const;
export type EntityName = (typeof ENTITY_NAMES)[number];

export function isEntityName(name: string): name is EntityName {
  return (ENTITY_NAMES as readonly string[]).includes(name);
}

export type Rec = Record<string, any> & {
  id: string;
  created_by_id: string | null;
  created_date: string;
  updated_date: string;
};

type Row = {
  id: string;
  created_by_id: string | null;
  data: Record<string, unknown>;
  created_date: Date | string;
  updated_date: Date | string;
};

const BASE_COLUMNS = new Set(['id', 'created_by_id', 'created_date', 'updated_date']);
const FIELD_RE = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;

// Raw queries may hand back timestamps as Date or as Postgres text; normalize both.
function iso(v: Date | string): string {
  if (v instanceof Date) return v.toISOString();
  // Postgres text looks like "2026-01-01 13:14:05.43+00"; make it strict ISO.
  return new Date(String(v).replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')).toISOString();
}

export function toRec(row: Row): Rec {
  return {
    ...row.data,
    id: row.id,
    created_by_id: row.created_by_id,
    created_date: iso(row.created_date),
    updated_date: iso(row.updated_date),
  };
}

// A scope adds a user-level restriction to a query (what a given user may see).
// It receives the shared params array, pushes its own values and returns SQL.
export type Scope = (params: unknown[]) => string | null;

export type Query = {
  entity: EntityName;
  filter?: Record<string, any>;
  sort?: string;
  limit?: number;
  scope?: Scope;
};

function where(filter: Record<string, any>, params: unknown[]): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(filter || {})) {
    if (!FIELD_RE.test(key)) throw new HttpError(400, `Invalid field "${key}"`);
    const isColumn = key === 'id' || key === 'created_by_id';
    const lhs = isColumn ? key : `(data -> $${params.push(key)}::text)`;
    if (value && typeof value === 'object' && !Array.isArray(value) && '$in' in value) {
      const list: unknown[] = value.$in;
      if (list.length === 0) {
        out.push('false');
        continue;
      }
      if (isColumn) {
        out.push(`${lhs} = any($${params.push(list.map(String))}::text[])`);
      } else {
        out.push(`${lhs} = any($${params.push(list.map((v) => JSON.stringify(v)))}::jsonb[])`);
      }
      continue;
    }
    if (isColumn) {
      out.push(`${lhs} = $${params.push(String(value))}`);
    } else {
      out.push(`${lhs} = $${params.push(JSON.stringify(value))}::jsonb`);
    }
  }
  return out;
}

function orderBy(sort: string | undefined, params: unknown[]): string {
  if (!sort) return 'created_date asc';
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  if (!FIELD_RE.test(field)) throw new HttpError(400, `Invalid sort "${sort}"`);
  const dir = desc ? 'desc' : 'asc';
  if (field === 'created_date' || field === 'updated_date') return `${field} ${dir}, id ${dir}`;
  if (field === 'id' || field === 'created_by_id') return `${field} ${dir}`;
  return `(data -> $${params.push(field)}::text) ${dir} nulls last, id ${dir}`;
}

export async function queryRecords(q: Query): Promise<Rec[]> {
  const params: unknown[] = [q.entity];
  const clauses = ['entity = $1'];
  clauses.push(...where(q.filter || {}, params));
  const scoped = q.scope?.(params);
  if (scoped) clauses.push(scoped);
  const limit = Math.min(Math.max(Number(q.limit) || 100, 1), 1000);
  const order = orderBy(q.sort, params);
  const rows = await client.unsafe<Row[]>(
    `select * from records where ${clauses.join(' and ')} order by ${order} limit ${limit}`,
    params as any[]
  );
  return rows.map(toRec);
}

export async function getRecord(entity: EntityName, id: string, scope?: Scope): Promise<Rec | null> {
  if (!isUuid(id)) return null;
  const params: unknown[] = [entity, id];
  const scoped = scope?.(params);
  const rows = await client.unsafe<Row[]>(
    `select * from records where entity = $1 and id = $2 ${scoped ? `and ${scoped}` : ''}`,
    params as any[]
  );
  return rows[0] ? toRec(rows[0]) : null;
}

export async function countRecords(entity: EntityName, filter: Record<string, any> = {}, scope?: Scope): Promise<number> {
  const params: unknown[] = [entity];
  const clauses = ['entity = $1', ...where(filter, params)];
  const scoped = scope?.(params);
  if (scoped) clauses.push(scoped);
  const [row] = await client.unsafe<{ n: string }[]>(
    `select count(*)::text as n from records where ${clauses.join(' and ')}`,
    params as any[]
  );
  return Number(row?.n ?? 0);
}

const SYSTEM_FIELDS = new Set(['id', 'created_by_id', 'created_date', 'updated_date']);

function strip(data: Record<string, any>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data || {})) if (!SYSTEM_FIELDS.has(k)) out[k] = v;
  return out;
}

export async function createRecord(entity: EntityName, data: Record<string, any>, createdById: string | null): Promise<Rec> {
  const id = randomUUID();
  const [row] = await client.unsafe<Row[]>(
    `insert into records (id, entity, created_by_id, data) values ($1, $2, $3, $4::jsonb) returning *`,
    [id, entity, createdById, JSON.stringify(strip(data))] as any[]
  );
  const rec = toRec(row);
  return rec;
}

export async function updateRecord(entity: EntityName, id: string, patch: Record<string, any>, scope?: Scope): Promise<Rec | null> {
  if (!isUuid(id)) return null;
  const params: unknown[] = [entity, id, JSON.stringify(strip(patch))];
  const scoped = scope?.(params);
  const rows = await client.unsafe<Row[]>(
    `update records set data = data || $3::jsonb, updated_date = now()
     where entity = $1 and id = $2 ${scoped ? `and ${scoped}` : ''} returning *`,
    params as any[]
  );
  if (!rows[0]) return null;
  const rec = toRec(rows[0]);
  return rec;
}

export async function deleteRecord(entity: EntityName, id: string, scope?: Scope): Promise<boolean> {
  if (!isUuid(id)) return false;
  const params: unknown[] = [entity, id];
  const scoped = scope?.(params);
  const rows = await client.unsafe<Row[]>(
    `delete from records where entity = $1 and id = $2 ${scoped ? `and ${scoped}` : ''} returning *`,
    params as any[]
  );
  if (!rows[0]) return false;
  const gone = toRec(rows[0]);
  return true;
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
