import { client } from '../db';
import type { Actor } from './auth';
import { displayName } from './auth';
import { HttpError, getRecord, isUuid, type EntityName, type Rec, type Scope } from './records';

// Who may do what with each entity. Enforced here, on the server.
//   public      : any signed-in user reads; only admins write (curriculum, Bible cache)
//   owner       : only the creator reads, writes, edits and deletes
//   studygroup  : creator and members read; any user creates (becomes host); host edits
//   group       : members of the referenced study group read and create; author edits
const KIND: Record<EntityName, 'public' | 'owner' | 'studygroup' | 'group'> = {
  Study: 'public',
  Lesson: 'public',
  BibleChapter: 'public',
  StudyGroup: 'studygroup',
  StudyProgress: 'owner',
  JournalEntry: 'owner',
  SessionEvent: 'owner',
  GroupMessage: 'group',
  LessonComment: 'group',
  SessionAttendance: 'group',
};

export const isAdminOnlyWrite = (entity: EntityName) => KIND[entity] === 'public';

const ownerScope =
  (uid: string): Scope =>
  (params) => {
    params.push(uid);
    return `records.created_by_id = $${params.length}`;
  };

const groupMemberScope =
  (uid: string): Scope =>
  (params) => {
    params.push(uid);
    const n = params.length;
    return `exists (select 1 from records g where g.entity = 'StudyGroup' and g.id = records.data->>'group_id' and g.data->'members' @> jsonb_build_array($${n}::text))`;
  };

const studyGroupScope =
  (actor: Actor): Scope | undefined =>
  (params) => {
    params.push(actor.id);
    const n = params.length;
    return `(records.created_by_id = $${n} or records.data->'members' @> jsonb_build_array($${n}::text))`;
  };

// SQL restriction for list/query/get/count. undefined means no restriction.
export function readScope(actor: Actor, entity: EntityName): Scope | undefined {
  switch (KIND[entity]) {
    case 'public':
      return undefined;
    case 'owner':
      return ownerScope(actor.id);
    case 'studygroup':
      return actor.role === 'admin' ? undefined : studyGroupScope(actor);
    case 'group':
      return groupMemberScope(actor.id);
  }
}

// Scope for update/delete. Admin-only entities are checked by the route before this.
export function writeScope(actor: Actor, entity: EntityName): Scope | undefined {
  if (KIND[entity] === 'public') return undefined;
  return ownerScope(actor.id);
}

export async function isGroupMember(uid: string, groupId: unknown) {
  if (typeof groupId !== 'string' || !isUuid(groupId)) return false;
  const rows = await client<{ ok: boolean }[]>`
    select true as ok from records
    where entity = 'StudyGroup' and id = ${groupId} and data->'members' @> jsonb_build_array(${uid}::text)
    limit 1`;
  return rows.length > 0;
}

// Used by the realtime stream to decide whether one change may reach one connected user.
export async function canRead(actor: Actor, entity: EntityName, rec: Rec | Record<string, any>): Promise<boolean> {
  switch (KIND[entity]) {
    case 'public':
      return true;
    case 'owner':
      return rec.created_by_id === actor.id;
    case 'studygroup':
      return (
        actor.role === 'admin' ||
        rec.created_by_id === actor.id ||
        (Array.isArray(rec.members) && rec.members.includes(actor.id))
      );
    case 'group':
      return isGroupMember(actor.id, rec.group_id);
  }
}

// Fills in and checks the server-owned fields of a new record. Clients cannot choose
// the author, the member list, or the host of a group.
export async function prepareCreate(actor: Actor, entity: EntityName, body: Record<string, any>) {
  const kind = KIND[entity];
  if (kind === 'public') {
    if (actor.role !== 'admin') throw new HttpError(403, 'Forbidden');
    return body;
  }
  if (kind === 'owner') return body;

  if (kind === 'studygroup') {
    const code = String(body.invite_code || '').trim().toUpperCase() || randomCode();
    return {
      ...body,
      invite_code: code,
      members: [actor.id],
      member_profiles: [{ user_id: actor.id, name: displayName(actor) }],
    };
  }

  // group-scoped: the caller must already belong to the group.
  const groupId = String(body.group_id || '');
  if (!isUuid(groupId)) throw new HttpError(400, 'A valid group id is required');
  const group = await getRecord('StudyGroup', groupId);
  if (!group) throw new HttpError(404, 'Group not found');
  const members: string[] = Array.isArray(group.members) ? group.members : [];
  if (!members.includes(actor.id) && group.created_by_id !== actor.id) {
    throw new HttpError(403, 'Only group members can post here');
  }
  const base = { ...body, group_id: groupId, members };
  if (entity === 'SessionAttendance') return { ...base, user_id: actor.id, user_name: displayName(actor) };
  if (entity === 'GroupMessage' || entity === 'LessonComment') {
    return { ...base, author_id: actor.id, author_name: displayName(actor) };
  }
  return base;
}

// Strips fields a client may not change on an existing record.
export function sanitizePatch(entity: EntityName, patch: Record<string, any>, actor: Actor) {
  const out = { ...patch };
  delete out.created_by_id;
  if (KIND[entity] === 'studygroup' && actor.role !== 'admin') {
    delete out.members;
    delete out.member_profiles;
  }
  if (KIND[entity] === 'group') {
    delete out.members;
    delete out.group_id;
    delete out.author_id;
    delete out.user_id;
  }
  return out;
}

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}
