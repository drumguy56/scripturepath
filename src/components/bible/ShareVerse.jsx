import { useState } from 'react';
import { Check, Copy, Facebook, Mail, MessageCircle, Share2, Twitter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ShareVerse({ verse, reference, translationLabel, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!verse) return null;

  const citation = `${reference}:${verse.verse}`;
  const message = `“${verse.text.trim()}” — ${citation}${
    translationLabel ? ` (${translationLabel})` : ''
  }`;
  const url = window.location.href;

  const openChannel = (href) => window.open(href, '_blank', 'noopener,noreferrer');

  const channels = [
    {
      label: 'X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(
        url
      )}`,
    },
    {
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}&quote=${encodeURIComponent(message)}`,
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`,
    },
    {
      label: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(citation)}&body=${encodeURIComponent(
        `${message}\n\n${url}`
      )}`,
    },
  ];

  const copy = async () => {
    await navigator.clipboard.writeText(`${message}\n\n${url}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareNative = () =>
    navigator
      .share({ title: citation, text: message, url })
      .catch(() => {});

  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-w-[460px] rounded-[16px] border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle className="font-heading text-[21px] leading-snug">
            Share {citation}
          </DialogTitle>
        </DialogHeader>

        <blockquote className="mt-1 border-l-2 border-primary/50 pl-4 font-heading text-[15px] leading-[1.75] text-foreground/85">
          {verse.text.trim()}
          <span className="mt-2 block font-body text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {citation}
            {translationLabel ? ` · ${translationLabel}` : ''}
          </span>
        </blockquote>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {channels.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              type="button"
              onClick={() => openChannel(href)}
              className="inline-flex items-center gap-2.5 rounded-[4px] border border-border px-4 py-2.5 text-[12.5px] font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary/60"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={copy}
            className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-[4px] bg-[hsl(197_100%_54%)] px-4 py-2.5 text-[12.5px] font-medium uppercase tracking-[0.1em] text-[hsl(210_65%_10%)] shadow-[0_14px_34px_-18px_hsl(197_100%_60%/0.8)] transition-colors hover:bg-[hsl(197_100%_47%)]"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy verse'}
          </button>

          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              type="button"
              onClick={shareNative}
              className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-[4px] border border-border px-4 py-2.5 text-[12.5px] font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary/60"
            >
              <Share2 className="h-4 w-4" /> More
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}