import { useEffect, useState } from 'react';
import StudyCard from '@/components/StudyCard';
import { base44 } from '@/api/base44Client';

const FILTERS = ['All', 'Old Testament', 'New Testament', 'Psalms & Wisdom', 'Foundations'];

export default function Library() {
  const [filter, setFilter] = useState('All');
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const query = filter === 'All' ? {} : { category: filter };
        const page = await base44.entities.Study.filter(query, { sort: 'order', limit: 50 });
        if (active) setStudies(page.items);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <div className="mx-auto max-w-[1180px] px-5 pt-14 sm:px-8 md:pt-20">
      <p className="eyebrow">The library</p>
      <h1 className="mt-4 max-w-[640px] text-[clamp(1.9rem,4.2vw,2.75rem)] leading-[1.15]">
        Guided studies, written to be finished.
      </h1>
      <p className="mt-4 max-w-[520px] text-[15px] leading-[1.7] text-foreground/70">
        Each study is a short series of lessons. Read the passage, sit with the
        teaching, answer three questions — your progress is kept for you.
      </p>

      <div className="mt-10 flex flex-wrap gap-2 border-b border-border/80 pb-6">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full border px-4 py-2 text-[12.5px] transition-colors ${
              filter === item
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="aspect-[4/3] animate-pulse rounded-[14px] bg-secondary" />
              <div className="mt-4 h-3 w-24 animate-pulse rounded bg-secondary" />
              <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} to={`/study/${study.id}`} />
          ))}
        </div>
      )}

      {!loading && studies.length === 0 && (
        <p className="py-20 text-center text-[14px] text-muted-foreground">
          No studies in this section yet.
        </p>
      )}
    </div>
  );
}