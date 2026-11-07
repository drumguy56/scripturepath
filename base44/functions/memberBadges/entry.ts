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

    const group = await base44.asServiceRole.entities.StudyGroup.get(groupId).catch((error) =>
      error.status === 404 ? null : Promise.reject(error)
    );
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    const memberIds = Array.isArray(group.members) ? group.members.slice(0, 200) : [];
    if (!memberIds.includes(user.id) && group.created_by_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const peopleIds = Array.from(
      new Set([...memberIds, group.created_by_id, user.id].filter(Boolean))
    );
    const profiles = Array.isArray(group.member_profiles) ? group.member_profiles : [];

    let lessons = [];
    if (group.study_id) {
      const page = await base44.asServiceRole.entities.Lesson.filter(
        { study_id: group.study_id },
        { sort: 'order', limit: 60 }
      );
      lessons = page.items || [];
    }
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));

    const [progressPage, attendancePage] = await Promise.all([
      group.study_id
        ? base44.asServiceRole.entities.StudyProgress.filter(
            { study_id: group.study_id, created_by_id: { $in: peopleIds } },
            { limit: 200 }
          )
        : Promise.resolve({ items: [] }),
      base44.asServiceRole.entities.SessionAttendance.filter(
        { group_id: groupId, user_id: { $in: peopleIds } },
        { limit: 500 }
      ),
    ]);

    const doneByUser = {};
    for (const record of progressPage.items || []) {
      const count = (record.completed_lesson_ids || []).filter((id) => lessonIds.has(id)).length;
      doneByUser[record.created_by_id] = Math.max(doneByUser[record.created_by_id] || 0, count);
    }

    // Only sessions that have already come round can be attended.
    const today = new Date().toISOString().slice(0, 10);
    const pastSessions = buildSessions(group, lessons).filter((session) => session.date <= today);

    const attendedByUser = {};
    for (const record of attendancePage.items || []) {
      if (!record.user_id || !record.lesson_id) continue;
      const seen = attendedByUser[record.user_id] || new Set();
      seen.add(record.lesson_id);
      attendedByUser[record.user_id] = seen;
    }

    const members = peopleIds.map((id) => {
      const seen = attendedByUser[id] || new Set();
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
        name: profile?.name || (id === user.id ? user.full_name || user.email || 'You' : 'Member'),
        lessons_done: doneByUser[id] || 0,
        attended,
        streak,
      };
    });

    return Response.json({
      lessons_total: lessons.length,
      sessions_total: pastSessions.length,
      members,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}