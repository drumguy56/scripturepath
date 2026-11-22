import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
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

export default function BookPicker({ open, onOpenChange, currentSlug, onSelect }) {
  const [activeBook, setActiveBook] = useState(null);

  useEffect(() => {
    if (open) setActiveBook(null);
  }, [open]);

  const selected = findBook(activeBook);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] max-w-[700px] flex-col gap-0 overflow-hidden rounded-[14px] border-border bg-card p-0">
        <DialogHeader className="shrink-0 border-b border-border/70 px-6 py-5 text-left">
          <DialogTitle className="font-heading text-[20px] font-normal">
            {selected ? selected.name : 'Choose a passage'}
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-muted-foreground">
            {selected
              ? `Pick a chapter of ${selected.name} — ${selected.chapters} in all.`
              : 'Every book of the Bible, all 66, in their usual order.'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {!selected &&
            TESTAMENTS.map((testament) => {
              const books = BIBLE_BOOKS.filter((book) => book.testament === testament.id);
              return (
                <div key={testament.id} className="mb-7 last:mb-0">
                  <p className="mb-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {testament.label} · {books.length} books
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-3">
                    {books.map((book) => (
                      <button
                        key={book.slug}
                        type="button"
                        onClick={() => setActiveBook(book.slug)}
                        className={`flex items-center justify-between gap-2 rounded-[6px] px-2.5 py-2 text-left text-[13.5px] leading-snug transition-colors hover:bg-secondary ${
                          book.slug === currentSlug ? 'text-primary' : 'text-foreground/85'
                        }`}
                      >
                        <span>{book.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

          {selected && (
            <div>
              <button
                type="button"
                onClick={() => setActiveBook(null)}
                className="mb-4 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All books
              </button>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                {Array.from({ length: selected.chapters }, (_, index) => index + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      onSelect(selected.slug, num);
                      onOpenChange(false);
                    }}
                    className="grid h-10 place-items-center rounded-[6px] border border-border text-[13px] transition-colors hover:border-foreground/40 hover:bg-secondary"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}