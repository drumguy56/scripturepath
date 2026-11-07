import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

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
    if (!group.study_id || memberIds.length === 0) {
      return Response.json({ total: 0, completed: {} });
    }

    const lessonsPage = await base44.entities.Lesson.filter(
      { study_id: group.study_id },
      { limit: 60 }
    );
    const lessonIds = new Set((lessonsPage.items || []).map((lesson) => lesson.id));

    const progressPage = await base44.asServiceRole.entities.StudyProgress.filter(
      { study_id: group.study_id, created_by_id: { $in: memberIds } },
      { limit: 200 }
    );

    const completed = {};
    for (const record of progressPage.items || []) {
      const count = (record.completed_lesson_ids || []).filter((id) => lessonIds.has(id)).length;
      completed[record.created_by_id] = Math.max(completed[record.created_by_id] || 0, count);
    }

    return Response.json({ total: lessonIds.size, completed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}