import { Send } from 'lucide-react';

export default function ThreadComposer({ value, onChange, onSubmit, sending, placeholder }) {
  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 flex items-end gap-2 border-t border-border/70 pt-4">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        placeholder={placeholder}
        className="min-h-[56px] flex-1 resize-none rounded-[10px] border border-input bg-background/60 px-3.5 py-2.5 text-[14px] leading-[1.6] text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button
        type="submit"
        disabled={sending || !value.trim()}
        aria-label="Send message"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-foreground bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}