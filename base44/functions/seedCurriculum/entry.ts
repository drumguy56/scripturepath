import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { CURRICULUM } from '../../shared/curriculum.ts';

// One-time (and safely repeatable) seed of the study library.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await base44.asServiceRole.entities.Study.list();
    if (existing.length > 0) {
      return Response.json({ seeded: false, studies: existing.length });
    }

    let lessonTotal = 0;
    for (const entry of CURRICULUM) {
      const study = await base44.asServiceRole.entities.Study.create({
        ...entry.study,
        lesson_count: entry.lessons.length,
      });

      const lessons = entry.lessons.map((lesson, index) => ({
        ...lesson,
        study_id: study.id,
        order: index + 1,
      }));

      await base44.asServiceRole.entities.Lesson.bulkCreate(lessons);
      lessonTotal += lessons.length;
    }

    return Response.json({
      seeded: true,
      studies: CURRICULUM.length,
      lessons: lessonTotal,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}