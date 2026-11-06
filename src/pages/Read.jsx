import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DEFAULT_REFERENCE, findBook, stepReference } from '@/data/bibleBooks';
import ChapterReader from '@/components/bible/ChapterReader';
import BookPicker from '@/components/bible/BookPicker';

const TRANSLATIONS = [
  { id: 'nlt', label: 'New Living Translation' },
  { id: 'kjv', label: 'King James Version' },
  { id: 'web', label: 'World English Bible' },
  { id: 'asv', label: 'American Standard Version' },
];

const STORE_KEY = 'scripturepath:last-read';

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Read() {
  const params = useParams();
  const navigate = useNavigate();

  const [stored] = useState(readStored);
  const [translation, setTranslation] = useState(() =>
    TRANSLATIONS.some((item) => item.id === stored?.translation) ? stored.translation : 'kjv'
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [verses, setVerses] = useState([]);
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const book =
    findBook(params.bookSlug) || findBook(stored?.slug) || findBook(DEFAULT_REFERENCE.slug);
  const chapter = Math.min(
    Math.max(1, Number(params.chapter) || stored?.chapter || 1),
    book.chapters
  );
  const slug = book.slug;

  useEffect(() => {
    if (!params.bookSlug) navigate(`/read/${book.slug}/${chapter}`, { replace: true });
  }, [params.bookSlug]);

  useEffect(() => {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ slug, chapter, translation }));
  }, [slug, chapter, translation]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const response = await base44.functions.invoke('getBibleChapter', {
          book: book.name,
          chapter,
          translation,
        });
        if (!active) return;
        if (response.data?.error) {
          setError(response.data.error);
          setVerses([]);
        } else {
          setVerses(response.data.verses);
          setReference(response.data.reference);
        }
      } catch (err) {
        if (active) {
          setError('Please check your connection and try again.');
          setVerses([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [book.name, chapter, translation]);

  const previous = stepReference(slug, chapter, -1);
  const next = stepReference(slug, chapter, 1);

  const goTo = (target) => {
    if (!target) return;
    const targetBook = findBook(target.slug);
    if (!targetBook) return;
    const nextChapter = Math.min(Math.max(1, target.chapter), targetBook.chapters);
    if (targetBook.slug === slug && nextChapter === chapter) return;
    navigate(`/read/${targetBook.slug}/${nextChapter}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-[860px] px-5 pb-4 pt-12 sm:px-8 md:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <p className="eyebrow">Read</p>
          <h1 className="mt-3 text-[clamp(1.8rem,3.8vw,2.5rem)] leading-tight">
            {book.name}
          </h1>
          <p className="mt-1.5 text-[12.5px] uppercase tracking-[0.12em] text-muted-foreground">
            Chapter {chapter} of {book.chapters}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={translation}
            onChange={(event) => setTranslation(event.target.value)}
            aria-label="Translation"
            className="h-[38px] rounded-[4px] border border-border bg-card px-3 text-[12.5px] text-foreground/80 outline-none focus:border-foreground/40"
          >
            {TRANSLATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex h-[38px] items-center gap-2 rounded-[4px] border border-foreground/70 px-4 text-[12px] font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <BookOpen className="h-3.5 w-3.5" /> Passage
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between border-y border-border/70 py-3">
        <button
          type="button"
          onClick={() => goTo(previous)}
          disabled={!previous}
          className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Previous
        </button>
        <span className="text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground">
          {loading ? 'Loading' : reference}
        </span>
        <button
          type="button"
          onClick={() => goTo(next)}
          disabled={!next}
          className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          Next <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-10 rounded-[16px] border border-border/80 bg-card px-6 py-10 sm:px-12 sm:py-12">
        <ChapterReader
          reference={reference}
          verses={verses}
          loading={loading}
          error={error}
        />

        {translation === 'nlt' && !loading && !error && (
          <p className="mt-8 border-t border-border/70 pt-4 text-[11.5px] leading-relaxed text-muted-foreground">
            Scripture quotations marked NLT are taken from the Holy Bible, New Living
            Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by
            permission of Tyndale House Publishers. All rights reserved.
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {previous ? (
          <button
            type="button"
            onClick={() => goTo(previous)}
            className="rounded-[12px] border border-border p-5 text-left transition-colors hover:border-foreground/30"
          >
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Previous
            </span>
            <span className="mt-1.5 block font-heading text-[16px] leading-snug">
              {findBook(previous.slug)?.name} {previous.chapter}
            </span>
          </button>
        ) : (
          <div />
        )}
        {next && (
          <button
            type="button"
            onClick={() => goTo(next)}
            className="rounded-[12px] border border-border p-5 text-right transition-colors hover:border-foreground/30"
          >
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Next
            </span>
            <span className="mt-1.5 block font-heading text-[16px] leading-snug">
              {findBook(next.slug)?.name} {next.chapter}
            </span>
          </button>
        )}
      </div>

      <BookPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currentSlug={slug}
        onSelect={(nextSlug, nextChapter) => goTo({ slug: nextSlug, chapter: nextChapter })}
      />
    </div>
  );
}