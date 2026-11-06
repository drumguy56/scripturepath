import { Link } from 'react-router-dom';

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
      <p className="mt-4 text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground">
        {count} {count === 1 ? 'member' : 'members'}
      </p>
    </Link>
  );
}