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
    const existingSlugs = new Set(existing.map((study) => study.slug));

    let studyTotal = 0;
    let lessonTotal = 0;
    for (const entry of CURRICULUM) {
      if (existingSlugs.has(entry.study.slug)) continue;

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
      studyTotal += 1;
      lessonTotal += lessons.length;
    }

    return Response.json({
      seeded: studyTotal > 0,
      studies: studyTotal,
      lessons: lessonTotal,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}