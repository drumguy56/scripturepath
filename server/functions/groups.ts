import { and, eq } from 'drizzle-orm';
import { db, schema } from '../db';
import { requireAdmin, type Actor } from '../lib/auth';
import { getAccessToken } from '../lib/google';
import { readScope } from '../lib/policy';
import { HttpError, getRecord, isUuid } from '../lib/records';
import { countVerifiedUsers, getUserName, svc } from '../lib/svc';
import { CURRICULUM } from '../shared/curriculum';
import { buildSessions, eventTimes } from '../shared/groupSchedule';

const GOOGLE_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

// Groups a member can open (members and the host). Admins see everything.
async function readableGroup(actor: Actor, groupId: string) {
  if (!isUuid(groupId)) throw new HttpError(400, 'A valid group id is required');
  const group = await getRecord('StudyGroup', groupId, readScope(actor, 'StudyGroup'));
  if (!group) throw new HttpError(404, 'Group not found');
  return group;
}

function memberIdsOf(group: any): string[] {
  return Array.isArray(group.members) ? group.members.slice(0, 200) : [];
}

function requireMemberOrHost(actor: Actor, group: any) {
  const memberIds = memberIdsOf(group);
  if (!memberIds.includes(actor.id) && group.created_by_id !== actor.id) throw new HttpError(403, 'Forbidden');
  return memberIds;
}

export async function calendarStatus(actor: Actor) {
  const [row] = await db
    .select({ user_id: schema.calendarConnections.user_id })
    .from(schema.calendarConnections)
    .where(and(eq(schema.calendarConnections.user_id, actor.id), eq(schema.calendarConnections.provider, 'google')))
    .limit(1);
  return { connected: Boolean(row) };
}

// A single community number for the home screen. No user details are returned.
export async function communityStats() {
  return { members: await countVerifiedUsers() };
}

// Display names of everyone joined to the given study groups.
export async function groupMembers(actor: Actor, body: Record<string, any>) {
  const requested: string[] = Array.isArray(body.group_ids)
    ? body.group_ids.slice(0, 50).map(String).filter(isUuid)
    : [];
  if (requested.length === 0) return { groups: {} };

  const { items } = await svc.filter('StudyGroup', { id: { $in: requested } }, { limit: 50 });
  const groups: Record<string, { user_id: string; name: string }[]> = {};
  const nameCache = new Map<string, string>();

  for (const group of items) {
    const memberIds: string[] = group.members || [];
    const allowed = memberIds.includes(actor.id) || group.created_by_id === actor.id || actor.role === 'admin';
    if (!allowed) continue;

    const stored = new Map<string, string>(
      (group.member_profiles || []).map((profile: any) => [profile.user_id, profile.name])
    );
    const members = [];
    for (const memberId of memberIds) {
      let name = stored.get(memberId);
      if (!name) {
        if (!nameCache.has(memberId)) nameCache.set(memberId, (await getUserName(memberId)) || 'Member');
        name = nameCache.get(memberId);
      }
      members.push({ user_id: memberId, name });
    }
    groups[group.id] = members;
  }
  return { groups };
}

export async function groupProgress(actor: Actor, body: Record<string, any>) {
  const group = await readableGroup(actor, String(body.group_id || ''));
  const memberIds = memberIdsOf(group);
  if (!memberIds.includes(actor.id) && group.created_by_id !== actor.id) throw new HttpError(403, 'Forbidden');
  if (!group.study_id || memberIds.length === 0) return { total: 0, completed: {} };

  const lessons = await svc.filter('Lesson', { study_id: group.study_id }, { limit: 60 });
  const lessonIds = new Set(lessons.items.map((lesson) => lesson.id));
  const progress = await svc.filter(
    'StudyProgress',
    { study_id: group.study_id, created_by_id: { $in: memberIds } },
    { limit: 200 }
  );

  const completed: Record<string, number> = {};
  for (const record of progress.items) {
    const count = ((record.completed_lesson_ids as string[]) || []).filter((id) => lessonIds.has(id)).length;
    completed[record.created_by_id!] = Math.max(completed[record.created_by_id!] || 0, count);
  }
  return { total: lessonIds.size, completed };
}

export async function groupSessions(actor: Actor, body: Record<string, any>) {
  const group = await readableGroup(actor, String(body.group_id || ''));
  let lessons: any[] = [];
  if (group.study_id) {
    lessons = (await svc.filter('Lesson', { study_id: group.study_id }, { sort: 'order', limit: 60 })).items;
  }
  const today = new Date().toISOString().slice(0, 10);
  const sessions = buildSessions(group, lessons).map((session) => ({ ...session, is_past: session.date < today }));
  return {
    schedule: group.schedule_start
      ? { start: group.schedule_start, time: group.schedule_time || '19:00', cadence: group.schedule_cadence || 'Weekly' }
      : null,
    lesson_total: lessons.length,
    sessions,
  };
}

export async function memberBadges(actor: Actor, body: Record<string, any>) {
  const groupId = String(body.group_id || '');
  if (!isUuid(groupId)) throw new HttpError(400, 'A valid group id is required');
  const group = await svc.get('StudyGroup', groupId);
  if (!group) throw new HttpError(404, 'Group not found');
  const memberIds = requireMemberOrHost(actor, group);

  const peopleIds = Array.from(new Set([...memberIds, group.created_by_id, actor.id].filter(Boolean) as string[]));
  const profiles: any[] = Array.isArray(group.member_profiles) ? group.member_profiles : [];

  let lessons: any[] = [];
  if (group.study_id) {
    lessons = (await svc.filter('Lesson', { study_id: group.study_id }, { sort: 'order', limit: 60 })).items;
  }
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));

  const [progressPage, attendancePage] = await Promise.all([
    group.study_id
      ? svc.filter('StudyProgress', { study_id: group.study_id, created_by_id: { $in: peopleIds } }, { limit: 200 })
      : Promise.resolve({ items: [] as any[] }),
    svc.filter('SessionAttendance', { group_id: groupId, user_id: { $in: peopleIds } }, { limit: 500 }),
  ]);

  const doneByUser: Record<string, number> = {};
  for (const record of progressPage.items) {
    const count = ((record.completed_lesson_ids as string[]) || []).filter((id) => lessonIds.has(id)).length;
    doneByUser[record.created_by_id!] = Math.max(doneByUser[record.created_by_id!] || 0, count);
  }

  // Only sessions that have already come round can be attended.
  const today = new Date().toISOString().slice(0, 10);
  const pastSessions = buildSessions(group, lessons).filter((session) => session.date <= today);

  const attendedByUser: Record<string, Set<string>> = {};
  for (const record of attendancePage.items) {
    if (!record.user_id || !record.lesson_id) continue;
    (attendedByUser[record.user_id] ||= new Set()).add(record.lesson_id);
  }

  const members = peopleIds.map((id) => {
    const seen = attendedByUser[id] || new Set<string>();
    const attended = pastSessions.filter((session) => seen.has(session.lesson_id)).length;
    let streak = 0;
    let run = 0;
    for (const session of pastSessions) {
      if (seen.has(session.lesson_id)) {
        run += 1;
        streak = Math.max(streak, run);
      } else {
        run = 0;
      }
    }
    const profile = profiles.find((person) => person?.user_id === id);
    return {
      user_id: id,
      name: profile?.name || (id === actor.id ? actor.full_name || actor.email || 'You' : 'Member'),
      lessons_done: doneByUser[id] || 0,
      attended,
      streak,
    };
  });

  return { lessons_total: lessons.length, sessions_total: pastSessions.length, members };
}

// Join a study group with an invite code, or leave one you are part of.
export async function studyGroupMembership(actor: Actor, body: Record<string, any>) {
  const action = body.action;
  if (action !== 'join' && action !== 'leave') throw new HttpError(400, 'action must be join or leave');
  const displayName = actor.full_name || actor.email || 'Member';

  if (action === 'join') {
    const code = String(body.invite_code || '').trim().toUpperCase();
    if (!code) throw new HttpError(400, 'An invite code is required');

    const { items } = await svc.filter('StudyGroup', { invite_code: code }, { limit: 1 });
    const group = items[0];
    if (!group) throw new HttpError(404, 'That invite code is not valid');

    const members: string[] = group.members || [];
    if (members.includes(actor.id)) return { group };

    const updated = await svc.update('StudyGroup', group.id, {
      members: [...members, actor.id],
      member_profiles: [...(group.member_profiles || []), { user_id: actor.id, name: displayName }],
    });
    return { group: updated };
  }

  const groupId = String(body.group_id || '');
  if (!groupId) throw new HttpError(400, 'group_id is required');
  if (!isUuid(groupId)) throw new HttpError(404, 'Group not found');
  const group = await svc.get('StudyGroup', groupId);
  if (!group) throw new HttpError(404, 'Group not found');
  if (!(group.members || []).includes(actor.id)) throw new HttpError(403, 'You are not in this group');
  if (group.created_by_id === actor.id) throw new HttpError(400, 'The host cannot leave the group');

  const updated = await svc.update('StudyGroup', groupId, {
    members: (group.members || []).filter((id: string) => id !== actor.id),
    member_profiles: (group.member_profiles || []).filter((p: any) => p.user_id !== actor.id),
  });
  return { group: updated };
}

export async function syncGroupSessions(actor: Actor, body: Record<string, any>) {
  const groupId = String(body.group_id || '');
  const group = await readableGroup(actor, groupId);
  const timezone = /^[A-Za-z0-9/_+\-]{1,64}$/.test(String(body.timezone || '')) ? String(body.timezone) : 'UTC';
  if (!group.schedule_start) throw new HttpError(400, 'Set the group schedule first');

  const lessons = (await svc.filter('Lesson', { study_id: group.study_id }, { sort: 'order', limit: 60 })).items;
  const sessions = buildSessions(group, lessons);
  if (sessions.length === 0) throw new HttpError(400, 'This group has no lessons to schedule yet');

  const accessToken = await getAccessToken(actor.id);
  if (!accessToken) throw new HttpError(409, 'not_connected');

  const links = await svc.filter('SessionEvent', { group_id: groupId, created_by_id: actor.id });
  const linkByLesson = new Map(links.items.map((link) => [link.lesson_id, link]));
  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  type Outcome = { lesson_id?: string; event_id?: string; create?: boolean; update_id?: string; error?: string };

  const upsert = async (session: any): Promise<Outcome> => {
    const { start, end } = eventTimes(session);
    const payload = {
      summary: `${group.name}: ${session.title}`,
      description: [session.scripture_reference, `ScripturePath group session for ${group.name}.`]
        .filter(Boolean)
        .join('\n'),
      start: { dateTime: start, timeZone: timezone },
      end: { dateTime: end, timeZone: timezone },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 1440 },
          { method: 'email', minutes: 60 },
        ],
      },
    };

    const existing: any = linkByLesson.get(session.lesson_id);
    if (existing) {
      const res = await fetch(`${GOOGLE_EVENTS_URL}/${encodeURIComponent(existing.event_id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 404) {
        linkByLesson.delete(session.lesson_id);
      } else if (!res.ok) {
        throw new Error(`Google Calendar rejected the update (${res.status})`);
      } else {
        return { lesson_id: session.lesson_id, event_id: existing.event_id, update_id: existing.id };
      }
    }

    const created = await fetch(GOOGLE_EVENTS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!created.ok) throw new Error(`Google Calendar rejected the event (${created.status})`);
    const data: any = await created.json();
    return { lesson_id: session.lesson_id, event_id: data.id, create: true };
  };

  const outcomes: Outcome[] = [];
  for (let i = 0; i < sessions.length; i += 6) {
    const settled = await Promise.allSettled(sessions.slice(i, i + 6).map((session) => upsert(session)));
    for (const result of settled) {
      outcomes.push(result.status === 'fulfilled' ? result.value : { error: (result.reason as Error)?.message });
    }
  }

  for (const o of outcomes.filter((o) => o.create)) {
    await svc.create('SessionEvent', { group_id: groupId, lesson_id: o.lesson_id, event_id: o.event_id }, actor.id);
  }
  for (const o of outcomes.filter((o) => o.update_id)) {
    await svc.update('SessionEvent', o.update_id!, { event_id: o.event_id });
  }

  return {
    synced: outcomes.filter((o) => o.event_id).length,
    failed: outcomes.filter((o) => o.error).length,
    total: sessions.length,
  };
}

// Idempotent: adds only studies whose slug is not already in the library.
export async function seedCurriculum(actor: Actor) {
  requireAdmin(actor);
  const existingSlugs = new Set((await svc.list('Study')).map((study) => study.slug));

  let studyTotal = 0;
  let lessonTotal = 0;
  for (const entry of CURRICULUM) {
    if (existingSlugs.has(entry.study.slug)) continue;
    const study = await svc.create('Study', { ...entry.study, lesson_count: entry.lessons.length }, actor.id);
    for (const [index, lesson] of entry.lessons.entries()) {
      await svc.create('Lesson', { ...lesson, study_id: study.id, order: index + 1 }, actor.id);
    }
    studyTotal += 1;
    lessonTotal += entry.lessons.length;
  }
  return { seeded: studyTotal > 0, studies: studyTotal, lessons: lessonTotal };
}
