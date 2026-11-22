import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { entities } from '@/api/client';
import { Image } from '@/components/ui/image';
import StudyChat from '@/components/study/StudyChat';

export default function StudyDetail() {
  const { studyId } = useParams();
  const [study, setStudy] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [studyRecord, lessonPage, progressList] = await Promise.all([
          entities.Study.get(studyId).catch((e) => (e.status === 404 ? null : Promise.reject(e))),
          entities.Lesson.filter({ study_id: studyId }, { sort: 'order', limit: 100 }),
          entities.StudyProgress.filter({ study_id: studyId }),
        ]);
        if (!active) return;
        setStudy(studyRecord);
        setLessons(lessonPage.items);
        setProgress(progressList[0] || null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [studyId]);

  useEffect(() => {
    if (loading || study) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, [loading, study]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8">
        <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        <div className="mt-6 h-12 w-[70%] animate-pulse rounded bg-secondary" />
        <div className="mt-4 h-4 w-[45%] animate-pulse rounded bg-secondary" />
        <div className="mt-12 aspect-[16/7] w-full animate-pulse rounded-[14px] bg-secondary" />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-24 text-center sm:px-8">
        <h1 className="text-[30px]">This study is not here.</h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          It may have been removed, or the link may be wrong.
        </p>
        <Link
          to="/library"
          className="mt-8 inline-block text-[12.5px] uppercase tracking-[0.14em] text-primary hover:underline"
        >
          Back to the library
        </Link>
      </div>
    );
  }

  const completed = progress?.completed_lesson_ids || [];
  const percent = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0;
  const nextLesson =
    lessons.find((lesson) => !completed.includes(lesson.id)) || lessons[lessons.length - 1];

  return (
    <div className="mx-auto max-w-[1180px] px-5 pt-10 sm:px-8 md:pt-14">
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All studies
      </Link>

      <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="eyebrow">
            {study.category} · {study.level}
          </p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3rem)] leading-[1.1]">{study.title}</h1>
          <p className="mt-5 max-w-[520px] text-[15px] leading-[1.75] text-foreground/75">
            {study.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              to={`/study/${study.id}/lesson/${nextLesson?.id}`}
              className="inline-flex items-center gap-2 rounded-[4px] bg-primary px-5 py-3 text-[12.5px] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-foreground"
            >
              {completed.length > 0 ? 'Continue study' : 'Start the study'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-[12.5px] text-muted-foreground">
              {lessons.length} lessons · {study.duration_label}
            </span>
          </div>
        </div>

        <div className="relative aspect-[5/4] overflow-hidden rounded-[14px] bg-muted">
          <Image src={study.cover_image} alt="" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.55fr_1fr]">
        <section>
          <h2 className="text-[22px]">Lessons</h2>
          <ol className="mt-5 border-y border-border/70">
            {lessons.map((lesson) => {
              const done = completed.includes(lesson.id);
              return (
                <li key={lesson.id} className="border-b border-border/70 last:border-b-0">
                  <Link
                    to={`/study/${study.id}/lesson/${lesson.id}`}
                    className="group flex items-start gap-5 py-5"
                  >
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11.5px] ${
                        done
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : lesson.order}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[16.5px] leading-snug transition-colors group-hover:text-primary">
                        {lesson.title}
                      </span>
                      <span className="mt-1 block text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
                        {lesson.scripture_reference}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="lg:pt-1">
          <div className="rounded-[14px] border border-border bg-card p-7">
            <p className="eyebrow">Your progress</p>
            <p className="mt-4 font-heading text-[38px] leading-none">{percent}%</p>
            <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-3 text-[12.5px] text-muted-foreground">
              {completed.length} of {lessons.length} lessons finished
            </p>
            {nextLesson && (
              <div className="mt-6 border-t border-border/70 pt-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Next lesson
                </p>
                <p className="mt-2 text-[14.5px] leading-snug">{nextLesson.title}</p>
                <Link
                  to={`/study/${study.id}/lesson/${nextLesson.id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-primary hover:underline"
                >
                  Open lesson <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
          {lessons.length > 0 && (
            <div className="mt-5">
              <StudyChat study={study} lessons={lessons} defaultLessonId={nextLesson?.id} />
            </div>
          )}
          <p className="mt-5 text-[12.5px] leading-relaxed text-muted-foreground">
            Work at your own pace. Everything you write in a lesson is saved to your
            journal, private to you.
          </p>
        </aside>
      </div>
    </div>
  );
}