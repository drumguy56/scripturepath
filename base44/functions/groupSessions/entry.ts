import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildSessions } from '../../shared/groupSchedule.ts';

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

    // User-scoped read: the group RLS only returns groups this member belongs to.
    const group = await base44.entities.StudyGroup.get(groupId).catch((error) => {
      if (error.status === 404 || error.status === 403) return null;
      return Promise.reject(error);
    });
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    let lessons = [];
    if (group.study_id) {
      const page = await base44.entities.Lesson.filter(
        { study_id: group.study_id },
        { sort: 'order', limit: 60 }
      );
      lessons = page.items || [];
    }

    const today = new Date().toISOString().slice(0, 10);
    const sessions = buildSessions(group, lessons).map((session) => ({
      ...session,
      is_past: session.date < today,
    }));

    return Response.json({
      schedule: group.schedule_start
        ? {
            start: group.schedule_start,
            time: group.schedule_time || '19:00',
            cadence: group.schedule_cadence || 'Weekly',
          }
        : null,
      lesson_total: lessons.length,
      sessions,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}