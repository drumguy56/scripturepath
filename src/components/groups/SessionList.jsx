import { format, parseISO } from 'date-fns';
import { CalendarDays, Check } from 'lucide-react';

export default function SessionList({ sessions, attended, onCheckIn, checkingId }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ul className="mt-4 divide-y divide-border/60 border-y border-border/60">
      {sessions.map((session, index) => {
        const when = parseISO(`${session.date}T${session.time}`);
        const openForCheckIn = session.date <= today;
        const isIn = Boolean(attended?.has(session.lesson_id));
        return (
          <li
            key={session.lesson_id}
            className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 py-3 ${
              session.is_past ? 'opacity-55' : ''
            }`}
          >
            <div className="flex min-w-0 items-baseline gap-3">
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[14.5px] text-foreground/90">{session.title}</p>
                {session.scripture_reference && (
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {session.scripture_reference}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-1.5 text-[12.5px] uppercase tracking-[0.08em] text-muted-foreground">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {format(when, 'EEE, MMM d · h:mm a')}
              </p>

              {openForCheckIn &&
                (isIn ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.1em] text-primary">
                    <Check className="h-3 w-3" aria-hidden="true" /> Checked in
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCheckIn?.(session)}
                    disabled={checkingId === session.lesson_id}
                    className="rounded-full border border-border px-2.5 py-1 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                  >
                    {checkingId === session.lesson_id ? 'Saving…' : 'Check in'}
                  </button>
                ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}