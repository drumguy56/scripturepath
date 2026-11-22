import { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareVerse from '@/components/bible/ShareVerse';

const LOADING_LINES = [97, 100, 92, 100, 88, 96, 75];

export default function ChapterReader({ reference, verses, loading, error, translationLabel }) {
  const [sharedVerse, setSharedVerse] = useState(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {LOADING_LINES.map((width, index) => (
          <div
            key={index}
            className="h-[15px] animate-pulse rounded bg-secondary"
            style={{ width: `${width}%`, animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[12px] border border-border bg-card px-6 py-10 text-center">
        <p className="font-heading text-[19px]">This passage could not be loaded.</p>
        <p className="mx-auto mt-2 max-w-[380px] text-[13.5px] leading-relaxed text-muted-foreground">
          {error}
        </p>
      </div>
    );
  }

  if (!verses?.length) return null;

  return (
    <div>
      <p className="eyebrow">{reference}</p>
      <div className="mt-6 space-y-[18px] font-heading text-[clamp(1.06rem,1.9vw,1.2rem)] leading-[1.85] text-foreground/90">
        {verses.map((verse) => (
          <p key={verse.verse} className="group">
            <sup className="mr-1.5 font-body text-[10px] font-medium tracking-wide text-primary">
              {verse.verse}
            </sup>
            {verse.text}
            <button
              type="button"
              onClick={() => setSharedVerse(verse)}
              aria-label={`Share ${reference}:${verse.verse}`}
              className="ml-2 inline-flex translate-y-[2px] items-center rounded-full p-1 text-muted-foreground/60 transition-colors hover:bg-secondary hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground focus-visible:outline-none"
            >
              <Share2 className="h-[13px] w-[13px]" aria-hidden="true" />
            </button>
          </p>
        ))}
      </div>

      {sharedVerse && (
        <ShareVerse
          verse={sharedVerse}
          reference={reference}
          translationLabel={translationLabel}
          onClose={() => setSharedVerse(null)}
        />
      )}
    </div>
  );
}