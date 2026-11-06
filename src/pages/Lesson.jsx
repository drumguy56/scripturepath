import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';

export default function Lesson() {
  const { studyId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [study, setStudy] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [progress, setProgress] = useState(null);
  const [entries, setEntries] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savedPrompt, setSavedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSavedPrompt(null);
    (async () => {
      try {
        const lessonRecord = await base44.entities.Lesson.get(lessonId).catch((e) =>
          e.status === 404 ? null : Promise.reject(e)
        );
        if (!lessonRecord) {
          if (active) setLesson(null);
          return;
        }
        const [studyRecord, lessonPage, progressList, entryPage] = await Promise.all([
          base44.entities.Study.get(lessonRecord.study_id),
          base44.entities.Lesson.filter(
            { study_id: lessonRecord.study_id },
            { sort: 'order', limit: 100 }
          ),
          base44.entities.StudyProgress.filter({ study_id: lessonRecord.study_id }),
          base44.entities.JournalEntry.filter(
            { lesson_id: lessonId },
            { sort: '-created_date', limit: 50 }
          ),
        ]);
        if (!active) return;

        setLesson(lessonRecord);
        setStudy(studyRecord);
        setSiblings(lessonPage.items);
        setEntries(entryPage.items);

        const existing = progressList[0];
        if (existing) {
          setProgress(existing);
          if (existing.last_lesson_id !== lessonId) {
            const updated = await base44.entities.StudyProgress.update(existing.id, {
              last_lesson_id: lessonId,
              last_active: new Date().toISOString(),
            });
            if (active) setProgress(updated);
          }
        } else {
          const created = await base44.entities.StudyProgress.create({
            study_id: lessonRecord.study_id,
            study_title: studyRecord.title,
            completed_lesson_ids: [],
            last_lesson_id: lessonId,
            last_active: new Date().toISOString(),
          });
          if (active) setProgress(created);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [lessonId]);

  useEffect(() => {
    if (!lesson) return;
    const map = {};
    (lesson.reflection_prompts || []).forEach((prompt) => {
      const found = entries.find((entry) => entry.prompt === prompt);
      map[prompt] = found?.content || '';
    });
    setDrafts(map);
  }, [lesson, entries]);

  const index = useMemo(
    () => siblings.findIndex((item) => item.id === lessonId),
    [siblings, lessonId]
  );
  const nextLesson = index >= 0 ? siblings[index + 1] : null;
  const isComplete = (progress?.completed_lesson_ids || []).includes(lessonId);

  const saveReflection = async (prompt) => {
    const content = (drafts[prompt] || '').trim();
    if (!content) return;
    const existing = entries.find((entry) => entry.prompt === prompt);
    if (existing) {
      if (existing.content === content) {
        setSavedPrompt(prompt);
        return;
      }
      const updated = await base44.entities.JournalEntry.update(existing.id, { content });
      setEntries((list) => list.map((entry) => (entry.id === updated.id ? updated : entry)));
    } else {
      const created = await base44.entities.JournalEntry.create({
        study_id: studyId,
        study_title: study?.title,
        lesson_id: lessonId,
        lesson_title: lesson?.title,
        prompt,
        content,
      });
      setEntries((list) => [...list, created]);
    }
    setSavedPrompt(prompt);
  };

  const markComplete = async () => {
    if (!progress) return;
    setCompleting(true);
    const completed = progress.completed_lesson_ids || [];
    const nextCompleted = completed.includes(lessonId) ? completed : [...completed, lessonId];
    const updated = await base44.entities.StudyProgress.update(progress.id, {
      completed_lesson_ids: nextCompleted,
      last_lesson_id: lessonId,
      last_active: new Date().toISOString(),
    });
    setProgress(updated);
    setCompleting(false);
    if (nextLesson) {
      navigate(`/study/${studyId}/lesson/${nextLesson.id}`);
    } else {
      navigate(`/study/${studyId}`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-20 sm:px-8">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
        <div className="mt-6 h-10 w-[80%] animate-pulse rounded bg-secondary" />
        <div className="mt-10 h-[220px] w-full animate-pulse rounded-[14px] bg-secondary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-24 text-center sm:px-8">
        <h1 className="text-[28px]">This lesson is not here.</h1>
        <Link
          to="/library"
          className="mt-6 inline-block text-[12.5px] uppercase tracking-[0.14em] text-primary hover:underline"
        >
          Back to the library
        </Link>
      </div>
    );
  }

  const paragraphs = (lesson.teaching || '').split('\n\n').filter(Boolean);

  return (
    <article className="mx-auto max-w-[760px] px-5 pb-8 pt-10 sm:px-8 md:pt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/study/${studyId}`}
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {study?.title || 'Study'}
        </Link>
        <span className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Lesson {lesson.order} of {siblings.length}
        </span>
      </div>

      <h1 className="mt-6 text-[clamp(1.85rem,4vw,2.6rem)] leading-[1.12]">{lesson.title}</h1>
      <p className="mt-3 text-[12px] uppercase tracking-[0.16em] text-primary">
        {lesson.scripture_reference}
      </p>

      <div className="mt-8 rounded-[14px] border border-border/80 bg-secondary/50 px-6 py-8 sm:px-9 sm:py-10">
        <p className="scripture-block whitespace-pre-line">{lesson.scripture_text}</p>
      </div>

      <div className="prose-teaching mt-10 text-[15.5px] text-foreground/85">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-14">
        <p className="eyebrow">Reflect</p>
        <h2 className="mt-3 text-[22px] leading-snug">Three questions to sit with</h2>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Written answers are saved to your journal. Short is fine.
        </p>

        <div className="mt-8 space-y-8">
          {(lesson.reflection_prompts || []).map((prompt, questionIndex) => (
            <div key={prompt}>
              <div className="flex gap-3">
                <span className="mt-0.5 font-heading text-[13px] text-primary">
                  {String(questionIndex + 1).padStart(2, '0')}
                </span>
                <label
                  htmlFor={`prompt-${questionIndex}`}
                  className="text-[16px] leading-[1.5] text-foreground"
                >
                  {prompt}
                </label>
              </div>
              <Textarea
                id={`prompt-${questionIndex}`}
                value={drafts[prompt] || ''}
                onChange={(event) =>
                  setDrafts((current) => ({ ...current, [prompt]: event.target.value }))
                }
                placeholder="Write as much or as little as you like…"
                className="mt-3 min-h-[104px] resize-none rounded-[10px] border-border bg-card text-[14.5px] leading-relaxed focus-visible:ring-1 focus-visible:ring-primary"
              />
              <div className="mt-2 flex h-5 items-center justify-between">
                <button
                  type="button"
                  onClick={() => saveReflection(prompt)}
                  disabled={!(drafts[prompt] || '').trim()}
                  className="text-[12px] uppercase tracking-[0.12em] text-primary transition-opacity hover:opacity-70 disabled:opacity-30"
                >
                  Save to journal
                </button>
                {savedPrompt === prompt && (
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                    <Check className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {lesson.prayer && (
        <section className="mt-14 rounded-[14px] bg-secondary/60 px-6 py-7 sm:px-8">
          <p className="eyebrow">Pray</p>
          <p className="mt-3 font-heading text-[18px] leading-[1.6] text-foreground/90">
            {lesson.prayer}
          </p>
        </section>
      )}

      <footer className="mt-14 border-t border-border/80 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={markComplete}
            disabled={completing}
            className="inline-flex items-center gap-2 rounded-[4px] bg-primary px-5 py-3 text-[12.5px] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-foreground disabled:opacity-60"
          >
            {isComplete ? 'Next lesson' : 'Mark complete'}{' '}
            <ArrowRight className="h-4 w-4" />
          </button>
          {isComplete && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Check className="h-3.5 w-3.5" /> Finished
            </span>
          )}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {index > 0 && (
            <Link
              to={`/study/${studyId}/lesson/${siblings[index - 1].id}`}
              className="rounded-[12px] border border-border p-5 transition-colors hover:border-foreground/30"
            >
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Previous
              </span>
              <span className="mt-1.5 block text-[14.5px] leading-snug">
                {siblings[index - 1].title}
              </span>
            </Link>
          )}
          {nextLesson && (
            <Link
              to={`/study/${studyId}/lesson/${nextLesson.id}`}
              className="rounded-[12px] border border-border p-5 transition-colors hover:border-foreground/30 sm:text-right"
            >
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Next
              </span>
              <span className="mt-1.5 block text-[14.5px] leading-snug">{nextLesson.title}</span>
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}