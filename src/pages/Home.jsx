import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/Hero';
import VerseOfTheDay from '@/components/VerseOfTheDay';
import WeatherCard from '@/components/WeatherCard';
import ReadPassageCard from '@/components/ReadPassageCard';
import StudyCard from '@/components/StudyCard';
import ContinueStudyCard from '@/components/ContinueStudyCard';
import { base44 } from '@/api/base44Client';

const HOW_IT_WORKS = [
  {
    title: 'Read the passage',
    body: 'Every lesson opens with a short passage, printed in full so there is nothing to look up.',
  },
  {
    title: 'Sit with the teaching',
    body: 'A few hundred words of context and thought — enough to open the text, not to close it.',
  },
  {
    title: 'Answer, and write it down',
    body: 'Three questions per lesson. Your answers are saved to your journal, private to you.',
  },
];

export default function Home() {
  const [studies, setStudies] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [continueStudy, setContinueStudy] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [studyPage, progressPage, reflections, stats] = await Promise.all([
          base44.entities.Study.list({ sort: 'order', limit: 50 }),
          base44.entities.StudyProgress.list({ sort: '-last_active', limit: 20 }),
          base44.entities.JournalEntry.count(),
          base44.functions.invoke('communityStats').catch(() => null),
        ]);
        if (!active) return;
        setStudies(studyPage.items);
        setProgressList(progressPage.items);
        setReflectionCount(reflections);
        setMemberCount(stats?.data?.members || 0);

        const latest = progressPage.items[0];
        if (latest) {
          const [studyRecord, lessonPage] = await Promise.all([
            base44.entities.Study.get(latest.study_id).catch(() => null),
            base44.entities.Lesson.filter(
              { study_id: latest.study_id },
              { sort: 'order', limit: 100 }
            ),
          ]);
          const completed = latest.completed_lesson_ids || [];
          const next =
            lessonPage.items.find((lesson) => !completed.includes(lesson.id)) ||
            lessonPage.items[lessonPage.items.length - 1];
          if (active) {
            setContinueStudy(studyRecord);
            setNextLesson(next || null);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const lessonsFinished = progressList.reduce(
    (total, entry) => total + (entry.completed_lesson_ids?.length || 0),
    0
  );

  return (
    <>
      <section className="mx-auto max-w-[1180px] px-5 pt-6 sm:px-8 sm:pt-8">
        <VerseOfTheDay />
        <WeatherCard />
      </section>

      <Hero />

      <section className="mx-auto max-w-[1180px] px-5 pt-16 sm:px-8 md:pt-20">
        <div className="mb-6 flex items-end justify-between gap-6">
          <h2 className="text-[26px] leading-tight md:text-[30px]">Continue</h2>
          <Link
            to="/library"
            className="text-[12.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            All studies
          </Link>
        </div>

        {loading ? (
          <div className="h-[220px] animate-pulse rounded-[16px] bg-secondary" />
        ) : (
          <ContinueStudyCard
            study={continueStudy}
            nextLesson={nextLesson}
            completed={progressList[0]?.completed_lesson_ids?.length || 0}
          />
        )}

        {!loading && (
          <div className="mt-8 grid grid-cols-2 gap-y-6 border-y border-border/80 py-6 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border/80">
            {[
              { value: memberCount, label: 'Readers in the app' },
              { value: lessonsFinished, label: 'Lessons finished' },
              { value: reflectionCount, label: 'Reflections written' },
              { value: progressList.length, label: 'Studies begun' },
            ].map((stat) => (
              <div key={stat.label} className="px-4 first:pl-0">
                <p className="font-heading text-[26px] leading-none">{stat.value}</p>
                <p className="mt-2 text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pt-20 sm:px-8">
        <ReadPassageCard />
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pt-20 sm:px-8">
        <p className="eyebrow">How a lesson goes</p>
        <div className="mt-8 grid gap-10 border-t border-border/80 pt-8 sm:grid-cols-3 sm:gap-8">
          {HOW_IT_WORKS.map((step, index) => (
            <div key={step.title}>
              <span className="font-heading text-[13px] text-primary">0{index + 1}</span>
              <h3 className="mt-3 text-[19px] leading-snug">{step.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pt-20 sm:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The library</p>
            <h2 className="mt-3 text-[26px] leading-tight md:text-[30px]">Where to begin</h2>
          </div>
          <Link
            to="/library"
            className="hidden items-center gap-2 text-[12.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {studies.slice(0, 3).map((study) => (
            <StudyCard key={study.id} study={study} to={`/study/${study.id}`} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-[1180px] px-5 sm:px-8">
        <div className="rounded-[16px] bg-secondary/70 px-6 py-14 text-center sm:px-12 sm:py-16">
          <p className="mx-auto max-w-[560px] font-heading text-[24px] leading-[1.45] text-foreground sm:text-[28px]">
            “Thy word is a lamp unto my feet, and a light unto my path.”
          </p>
          <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
            Psalm 119:105
          </p>
        </div>
      </section>
    </>
  );
}