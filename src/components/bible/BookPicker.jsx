import { useEffect, useState } from 'react';
import { BIBLE_BOOKS, findBook } from '@/data/bibleBooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const TESTAMENTS = [
  { id: 'Old', label: 'Old Testament' },
  { id: 'New', label: 'New Testament' },
];

const selectClass =
  'h-[42px] w-full rounded-[4px] border border-border bg-card px-3 text-[14px] text-foreground outline-none focus:border-foreground/40';

export default function BookPicker({ open, onOpenChange, currentSlug, onSelect }) {
  const [bookSlug, setBookSlug] = useState(currentSlug);
  const [chapter, setChapter] = useState(1);

  useEffect(() => {
    if (open) {
      setBookSlug(findBook(currentSlug)?.slug ?? BIBLE_BOOKS[0].slug);
      setChapter(1);
    }
  }, [open, currentSlug]);

  const book = findBook(bookSlug) || BIBLE_BOOKS[0];

  const handleBookChange = (event) => {
    setBookSlug(event.target.value);
    setChapter(1);
  };

  const handleOpen = () => {
    onSelect(book.slug, chapter);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-[14px] border-border bg-card p-0">
        <DialogHeader className="border-b border-border/70 px-6 py-5 text-left">
          <DialogTitle className="font-heading text-[20px] font-normal">Choose a passage</DialogTitle>
          <DialogDescription className="text-[12.5px] text-muted-foreground">
            Pick a book and chapter of the Bible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label
              htmlFor="book-select"
              className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Book
            </label>
            <select
              id="book-select"
              value={book.slug}
              onChange={handleBookChange}
              className={selectClass}
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
          </div>

          <div className="space-y-2">
            <label
              htmlFor="chapter-select"
              className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Chapter
            </label>
            <select
              id="chapter-select"
              value={chapter}
              onChange={(event) => setChapter(Number(event.target.value))}
              className={selectClass}
            >
              {Array.from({ length: book.chapters }, (_, index) => index + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex h-[42px] w-full items-center justify-center rounded-[4px] border border-foreground/70 text-[12px] font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Open {book.name} {chapter}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
