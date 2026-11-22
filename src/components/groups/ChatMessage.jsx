import { formatDistanceToNow } from 'date-fns';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export default function ChatMessage({ message, mine }) {
  const name = mine ? 'You' : message.author_name || 'Member';
  const when = message.created_date
    ? formatDistanceToNow(new Date(message.created_date), { addSuffix: true })
    : '';

  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-secondary text-[10px] font-medium uppercase text-foreground/80">
        {initials(message.author_name || name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
          {when && (
            <time className="shrink-0 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
              {when}
            </time>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-[1.65] text-foreground/85">
          {message.body}
        </p>
      </div>
    </li>
  );
}