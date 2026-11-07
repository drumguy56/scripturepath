import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BIBLE_BOOKS, findBook } from '@/data/bibleBooks';

const TESTAMENTS = ['Old', 'New'];

const selectClass =
  'h-[42px] cursor-pointer rounded-[4px] border border-[hsl(197_100%_66%)] bg-[hsl(197_100%_54%)] px-3 text-[13.5px] font-medium text-[hsl(210_65%_10%)] outline-none shadow-[0_14px_34px_-18px_hsl(197_100%_60%/0.8)] transition-all duration-300 hover:bg-[hsl(197_100%_47%)] focus-visible:border-[hsl(210_65%_10%)] focus-visible:ring-2 focus-visible:ring-[hsl(197_100%_54%)]/50';

export default function ReadPassageCard() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState('john');
  const [chapter, setChapter] = useState(1);

  const book = findBook(slug) || BIBLE_BOOKS[0];

  const chooseBook = (value) => {
    setSlug(value);
    setChapter(1);
  };

  const open = () => navigate(`/read/${book.slug}/${chapter}`);

  return (
    <div className="grid overflow-hidden rounded-[16px] border border-border bg-card md:grid-cols-[1fr_auto] md:items-end">
      <div className="p-7 sm:p-9">
        <p className="eyebrow flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Read
        </p>
        <h2 className="mt-3 text-[26px] leading-tight">Open anywhere</h2>
        <p className="mt-3 max-w-[420px] text-[14px] leading-relaxed text-muted-foreground">
          Pick any book and chapter, in the translation you prefer. Nothing to sign up for.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <select
            value={slug}
            onChange={(event) => chooseBook(event.target.value)}
            aria-label="Book"
            className={`${selectClass} max-w-[220px]`}
          >
            {TESTAMENTS.map((testament) => (
              <optgroup key={testament} label={`${testament} Testament`}>
                {BIBLE_BOOKS.filter((item) => item.testament === testament).map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <select
            value={chapter}
            onChange={(event) => setChapter(Number(event.target.value))}
            aria-label="Chapter"
            className={selectClass}
          >
            {Array.from({ length: book.chapters }, (_, index) => index + 1).map((num) => (
              <option key={num} value={num}>
                Chapter {num}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={open}
            className="group inline-flex h-[42px] items-center gap-2 rounded-[4px] bg-[hsl(197_100%_54%)] px-5 text-[12.5px] font-medium uppercase tracking-[0.14em] text-[hsl(210_65%_10%)] shadow-[0_14px_34px_-16px_hsl(197_100%_60%/0.9)] transition-all duration-300 hover:bg-[hsl(197_100%_47%)] hover:shadow-[0_20px_44px_-16px_hsl(197_100%_62%/1)]"
          >
            Read {book.name} {chapter}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[2px]" />
          </button>
        </div>
      </div>

      <div className="hidden h-full items-end justify-end p-9 md:flex">
        <span className="font-heading text-[64px] leading-none text-primary/15">
          {chapter}
        </span>
      </div>
    </div>
  );
}