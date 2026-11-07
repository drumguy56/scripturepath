import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildSessions, eventTimes } from '../../shared/groupSchedule.ts';

const CONNECTOR_ID = '6aee69fd5485e89c4874baf5';
const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const groupId = String(body.group_id || '');
    if (!/^[0-9a-f]{24}$/i.test(groupId)) {
      return Response.json({ error: 'A valid group id is required' }, { status: 400 });
    }
    const timezone = /^[A-Za-z0-9/_+\-]{1,64}$/.test(String(body.timezone || ''))
      ? String(body.timezone)
      : 'UTC';

    const group = await base44.entities.StudyGroup.get(groupId).catch((error) => {
      if (error.status === 404 || error.status === 403) return null;
      return Promise.reject(error);
    });
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });
    if (!group.schedule_start) {
      return Response.json({ error: 'Set the group schedule first' }, { status: 400 });
    }

    const page = await base44.entities.Lesson.filter(
      { study_id: group.study_id },
      { sort: 'order', limit: 60 }
    );
    const sessions = buildSessions(group, page.items || []);
    if (sessions.length === 0) {
      return Response.json({ error: 'This group has no lessons to schedule yet' }, { status: 400 });
    }

    let accessToken;
    try {
      const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
      accessToken = connection.accessToken;
    } catch {
      return Response.json({ error: 'not_connected' }, { status: 409 });
    }

    const links = await base44.asServiceRole.entities.SessionEvent.filter({
      group_id: groupId,
      created_by_id: user.id,
    });
    const linkByLesson = new Map((links || []).map((link) => [link.lesson_id, link]));

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const upsert = async (session) => {
      const { start, end } = eventTimes(session);
      const payload = {
        summary: `${group.name}: ${session.title}`,
        description: [
          session.scripture_reference,
          `ScripturePath group session for ${group.name}.`,
        ]
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

      const existing = linkByLesson.get(session.lesson_id);
      if (existing) {
        const res = await fetch(`${EVENTS_URL}/${encodeURIComponent(existing.event_id)}`, {
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

      const created = await fetch(EVENTS_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      if (!created.ok) {
        throw new Error(`Google Calendar rejected the event (${created.status})`);
      }
      const data = await created.json();
      return { lesson_id: session.lesson_id, event_id: data.id, create: true };
    };

    const outcomes = [];
    for (let i = 0; i < sessions.length; i += 6) {
      const chunk = sessions.slice(i, i + 6);
      const settled = await Promise.allSettled(chunk.map((session) => upsert(session)));
      for (const result of settled) {
        outcomes.push(
          result.status === 'fulfilled' ? result.value : { error: result.reason?.message }
        );
      }
    }

    const creates = outcomes.filter((o) => o.create).map((o) => ({
      group_id: groupId,
      lesson_id: o.lesson_id,
      event_id: o.event_id,
    }));
    const updates = outcomes
      .filter((o) => o.update_id)
      .map((o) => ({ id: o.update_id, event_id: o.event_id }));

    if (creates.length > 0) await base44.asServiceRole.entities.SessionEvent.bulkCreate(creates);
    if (updates.length > 0) await base44.asServiceRole.entities.SessionEvent.bulkUpdate(updates);

    return Response.json({
      synced: outcomes.filter((o) => o.event_id).length,
      failed: outcomes.filter((o) => o.error).length,
      total: sessions.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}