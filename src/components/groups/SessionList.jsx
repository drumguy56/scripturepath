import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';

export default function SessionList({ sessions }) {
  return (
    <ul className="mt-4 divide-y divide-border/60 border-y border-border/60">
      {sessions.map((session, index) => {
        const when = parseISO(`${session.date}T${session.time}`);
        return (
          <li
            key={session.lesson_id}
            className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 ${
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
            <p className="flex items-center gap-1.5 text-[12.5px] uppercase tracking-[0.08em] text-muted-foreground">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {format(when, 'EEE, MMM d · h:mm a')}
            </p>
          </li>
        );
      })}
    </ul>
  );
}