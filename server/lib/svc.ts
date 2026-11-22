// Unrestricted record access for server-side functions (the old asServiceRole calls).
// Functions are responsible for their own permission checks.
import { client } from '../db';
import { countRecords, createRecord, getRecord, queryRecords, updateRecord, type EntityName, type Rec } from './records';

type Page = { items: Rec[] };
type Opts = { sort?: string; limit?: number };

export const svc = {
  async filter(entity: EntityName, filter: Record<string, any>, opts: Opts = {}): Promise<Page> {
    const items = await queryRecords({ entity, filter, sort: opts.sort, limit: opts.limit });
    return { items };
  },
  list(entity: EntityName, opts: Opts = {}): Promise<Rec[]> {
    return queryRecords({ entity, sort: opts.sort, limit: opts.limit });
  },
  get(entity: EntityName, id: string): Promise<Rec | null> {
    return getRecord(entity, id);
  },
  create(entity: EntityName, data: Record<string, any>, createdById: string | null = null): Promise<Rec> {
    return createRecord(entity, data, createdById);
  },
  update(entity: EntityName, id: string, patch: Record<string, any>): Promise<Rec | null> {
    return updateRecord(entity, id, patch);
  },
  count(entity: EntityName, filter: Record<string, any> = {}): Promise<number> {
    return countRecords(entity, filter);
  },
};

export async function getUserName(id: string): Promise<string | null> {
  const rows = await client<{ full_name: string; email: string }[]>`
    select full_name, email from users where id = ${id} limit 1`;
  const row = rows[0];
  return row ? row.full_name || row.email : null;
}

export async function countVerifiedUsers(): Promise<number> {
  const rows = await client<{ n: string }[]>`select count(*)::text as n from users where verified = true`;
  return Number(rows[0]?.n ?? 0);
}
