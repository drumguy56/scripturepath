import BadgeChip from '@/components/groups/BadgeChip';
import { evaluateBadges, nextBadge } from '@/lib/badges';

export default function MemberBadgeRow({ member, isYou, isHost }) {
  const badges = evaluateBadges(member);
  const earned = badges.filter((badge) => badge.earned);
  const next = nextBadge(badges);
  const NextIcon = next?.icon;

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary font-heading text-[12px]">
          {(member.name || 'M').trim().charAt(0).toUpperCase()}
        </span>
        <span className="text-[13.5px]">{member.name || 'Member'}</span>
        {isHost && (
          <span className="text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
            Host
          </span>
        )}
        {isYou && (
          <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-background">
            You
          </span>
        )}
        <span className="ml-auto text-[11px] tabular-nums uppercase tracking-[0.1em] text-muted-foreground">
          {member.attended} sessions · {member.lessons_done}/{member.lessons_total} lessons
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-11">
        {earned.length > 0 ? (
          earned.map((badge) => <BadgeChip key={badge.id} badge={badge} />)
        ) : (
          <span className="text-[12px] text-muted-foreground">
            No badges yet — the first one is close.
          </span>
        )}
        {next && (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <NextIcon className="h-3 w-3" aria-hidden="true" />
            {next.label} · {next.current}/{next.target}
          </span>
        )}
      </div>
    </li>
  );
}