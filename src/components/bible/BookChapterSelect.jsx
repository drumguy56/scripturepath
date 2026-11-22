import { BIBLE_BOOKS, findBook } from '@/data/bibleBooks';

const TESTAMENTS = [
  { id: 'Old', label: 'Old Testament' },
  { id: 'New', label: 'New Testament' },
];

const selectClass =
  'h-[38px] rounded-[4px] border border-border bg-card px-3 text-[12.5px] text-foreground/80 outline-none focus:border-foreground/40';

export default function BookChapterSelect({ slug, chapter, onChange, className = '' }) {
  const book = findBook(slug) || BIBLE_BOOKS[0];
  const current = Math.min(Math.max(1, Number(chapter) || 1), book.chapters);

  const handleBookChange = (event) => {
    onChange(event.target.value, 1);
  };

  const handleChapterChange = (event) => {
    onChange(book.slug, Number(event.target.value));
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <select
        value={book.slug}
        onChange={handleBookChange}
        aria-label="Book"
        className={`${selectClass} min-w-[170px]`}
      >
        {TESTAMENTS.map((testament) => (
          <optgroup key={testament.id} label={testament.label}>
            {BIBLE_BOOKS.filter((item) => item.testament === testament.id).map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <select
        value={current}
        onChange={handleChapterChange}
        aria-label="Chapter"
        className={selectClass}
      >
        {Array.from({ length: book.chapters }, (_, index) => index + 1).map((num) => (
          <option key={num} value={num}>
            Chapter {num}
          </option>
        ))}
      </select>
    </div>
  );
}
