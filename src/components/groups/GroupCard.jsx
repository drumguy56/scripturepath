import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export default function GroupCard({ group }) {
  const profiles = group.member_profiles || [];
  const count = profiles.length || group.members?.length || 0;
  const names = profiles.map((profile) => profile.name).filter(Boolean);
  const shown = names.slice(0, 3);
  const extra = names.length - shown.length;

  return (
    <Link
      to={`/groups/${group.id}`}
      className="block rounded-[14px] border border-border/80 bg-card/40 p-5 transition-colors hover:border-foreground/40"
    >
      <p className="eyebrow">{group.study_title || 'Group'}</p>
      <h3 className="mt-2 text-[19px] leading-snug">{group.name}</h3>
      {group.description && (
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">
          {group.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-3">
        {profiles.length > 0 && (
          <div className="flex shrink-0 -space-x-2">
            {profiles.slice(0, 4).map((profile) => (
              <span
                key={profile.user_id}
                className="grid h-7 w-7 place-items-center rounded-full border border-border bg-secondary text-[10px] font-medium uppercase text-foreground/80"
              >
                {initials(profile.name)}
              </span>
            ))}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[12.5px] leading-tight text-foreground/80">
            {shown.length > 0
              ? `${shown.join(', ')}${extra > 0 ? ` +${extra}` : ''}`
              : count === 0
                ? 'No members yet'
                : null}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            <Users className="h-3 w-3" aria-hidden="true" />
            {count} {count === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
    </Link>
  );
}