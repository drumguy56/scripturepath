export default function MemberList({ members = [], ownerId }) {
  return (
    <ul className="divide-y divide-border/70">
      {members.map((member) => (
        <li key={member.user_id} className="flex items-center gap-3 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary font-heading text-[13px]">
            {(member.name || 'M').trim().charAt(0).toUpperCase()}
          </span>
          <span className="truncate text-[13.5px]">{member.name || 'Member'}</span>
          {member.user_id === ownerId && (
            <span className="ml-auto text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Host
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}