import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { formatDayLabel, getVerseOfTheDay } from '@/data/dailyVerses';

export default function VerseOfTheDay() {
  const verse = getVerseOfTheDay();

  return (
    <div className="rounded-[16px] border border-border/80 bg-card px-7 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="eyebrow">Verse of the day</p>
        <p className="text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
          {formatDayLabel()}
        </p>
      </div>

      <p className="mt-5 max-w-[720px] font-heading text-[21px] leading-[1.55] sm:text-[25px]">
        “{verse.text}”
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-4">
        <p className="text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
          {verse.reference} · KJV
        </p>
        <Link
          to={`/read/${verse.slug}/${verse.chapter}`}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Read in context <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}