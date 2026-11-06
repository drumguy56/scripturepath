import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const page = await base44.entities.JournalEntry.list({
          sort: '-created_date',
          limit: 100,
        });
        if (active) setEntries(page.items);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => {
      const key = entry.lesson_title || 'Notes';
      if (!map.has(key)) {
        map.set(key, {
          title: entry.lesson_title,
          study: entry.study_title,
          studyId: entry.study_id,
          items: [],
        });
      }
      map.get(key).items.push(entry);
    });
    return Array.from(map.values());
  }, [entries]);

  return (
    <div className="mx-auto max-w-[900px] px-5 pt-12 sm:px-8 md:pt-16">
      <p className="eyebrow">Your journal</p>
      <h1 className="mt-4 text-[clamp(1.9rem,4.2vw,2.6rem)] leading-[1.15]">
        What you have written down
      </h1>
      <p className="mt-4 max-w-[520px] text-[14.5px] leading-[1.7] text-foreground/70">
        Every reflection you save from a lesson is kept here, private to you. Come back
        and read what you noticed a month ago.
      </p>

      {loading && (
        <div className="mt-12 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[14px] bg-secondary" />
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="mt-12 rounded-[14px] border border-border bg-card p-9">
          <h2 className="text-[20px]">Nothing here yet.</h2>
          <p className="mt-2 max-w-[420px] text-[14px] leading-relaxed text-muted-foreground">
            When you answer a reflection question inside a lesson, it is saved here
            automatically.
          </p>
          <Link
            to="/library"
            className="mt-6 inline-block rounded-[4px] bg-primary px-5 py-3 text-[12.5px] font-medium uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-foreground"
          >
            Start a study
          </Link>
        </div>
      )}

      <div className="mt-12 space-y-14">
        {groups.map((group) => (
          <section key={group.title}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/80 pb-3">
              <h2 className="text-[19px] leading-snug">{group.title}</h2>
              {group.studyId && (
                <Link
                  to={`/study/${group.studyId}`}
                  className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {group.study}
                </Link>
              )}
            </div>

            <div className="mt-6 space-y-7">
              {group.items.map((entry) => (
                <div key={entry.id} className="border-l border-border pl-5">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {format(new Date(entry.created_date), 'd MMM yyyy')}
                  </p>
                  <p className="mt-2 font-heading text-[16px] leading-snug text-foreground/80">
                    {entry.prompt}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-[14.5px] leading-[1.75] text-foreground/85">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}