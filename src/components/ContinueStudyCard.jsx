import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ContinueStudyCard({ study, nextLesson, completed = 0 }) {
  if (!study) {
    return (
      <div className="flex flex-col items-start justify-between gap-6 rounded-[16px] border border-border bg-card p-7 sm:flex-row sm:items-center sm:p-9">
        <div>
          <h3 className="text-[22px] leading-snug">You haven’t started a study yet.</h3>
          <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-muted-foreground">
            Pick one from the library. Six lessons, ten minutes each — you can stop
            in the middle and come back tomorrow.
          </p>
        </div>
        <Link
          to="/library"
          className="group relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-full bg-[hsl(18_92%_52%)] py-2 pl-6 pr-2 text-primary-foreground shadow-[0_18px_42px_-16px_hsl(18_92%_52%/0.85)] ring-1 ring-[hsl(18_92%_52%/0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[hsl(18_95%_46%)] hover:shadow-[0_28px_62px_-18px_hsl(18_92%_52%/0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(18_92%_52%)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-full w-full bg-[linear-gradient(100deg,transparent,hsl(var(--primary-foreground)/0.32),transparent)] transition-all duration-[900ms] ease-out group-hover:left-full"
          />
          <span className="relative text-[13px] font-medium uppercase tracking-[0.14em]">
            Find a study
          </span>
          <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--primary-foreground)/0.2)] transition-all duration-300 group-hover:bg-primary-foreground group-hover:text-[hsl(18_92%_48%)]">
            <ArrowRight className="h-[15px] w-[15px] transition-transform duration-300 group-hover:translate-x-[2px]" />
          </span>
        </Link>
      </div>
    );
  }

  const total = study.lesson_count || 1;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="grid overflow-hidden rounded-[16px] border border-border bg-card sm:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col justify-between p-7 sm:p-9">
        <div>
          <p className="eyebrow">In progress · {percent}% complete</p>
          <h3 className="mt-3 text-[26px] leading-tight">{study.title}</h3>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            Next up — {nextLesson?.title}
          </p>
        </div>

        <div className="mt-8">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11.5px] text-muted-foreground">
            <span>
              {completed} of {total} lessons
            </span>
            <span>{study.duration_label}</span>
          </div>
          <Link
            to={`/study/${study.id}/lesson/${nextLesson?.id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-primary px-5 py-3 text-[12.5px] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-foreground"
          >
            Continue lesson <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative hidden min-h-[220px] sm:block">
        <Image src={study.cover_image} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}