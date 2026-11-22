// Loads the built-in study curriculum. Safe to run repeatedly: studies already present (by slug) are skipped.
//   npm run seed
import { client } from './db';
import { svc } from './lib/svc';
import { CURRICULUM } from './shared/curriculum';

let studies = 0;
let lessons = 0;
const existing = new Set((await svc.list('Study')).map((study) => study.slug));

for (const entry of CURRICULUM) {
  if (existing.has(entry.study.slug)) continue;
  const study = await svc.create('Study', { ...entry.study, lesson_count: entry.lessons.length });
  for (const [index, lesson] of entry.lessons.entries()) {
    await svc.create('Lesson', { ...lesson, study_id: study.id, order: index + 1 });
  }
  studies += 1;
  lessons += entry.lessons.length;
}

console.log(`Seeded ${studies} studies and ${lessons} lessons.`);
await client.end();
