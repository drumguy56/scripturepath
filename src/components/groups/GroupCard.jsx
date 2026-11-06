import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function GroupCard({ group }) {
  const count = group.member_profiles?.length || group.members?.length || 0;

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
      <div className="mt-4 flex items-center gap-4 text-[12.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {count} {count === 1 ? 'member' : 'members'}
        </span>
      </div>
    </Link>
  );
}