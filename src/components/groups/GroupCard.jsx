import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

export default function GroupCard({ group, memberNames }) {
  const members = memberNames?.length ? memberNames : group.member_profiles || [];
  const count = members.length || group.members?.length || 0;

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

      <div className="mt-4 border-t border-border/60 pt-3">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          <Users className="h-3 w-3" aria-hidden="true" />
          {count} {count === 1 ? 'member' : 'members'}
        </p>

        {members.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {members.map((member) => (
              <li
                key={member.user_id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/60 py-1 pl-1 pr-2.5 text-[12px] text-foreground/85"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-foreground/10 text-[9px] font-medium uppercase">
                  {initials(member.name)}
                </span>
                {member.name || 'Member'}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[12px] text-muted-foreground">No members yet</p>
        )}
      </div>
    </Link>
  );
}