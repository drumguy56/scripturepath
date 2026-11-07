import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import MemberBadgeRow from '@/components/groups/MemberBadgeRow';
import { evaluateBadges } from '@/lib/badges';

export default function GroupBadges({ group, members, user }) {
  const [stats, setStats] = useState(null);

  const load = useCallback(async () => {
    const res = await base44.functions.invoke('memberBadges', { group_id: group.id });
    setStats(res.data);
  }, [group.id]);

  useEffect(() => {
    load();
  }, [load]);

  // A check-in or a finished lesson changes the badges straight away.
  useEffect(() => {
    const offAttendance = base44.entities.SessionAttendance.subscribe(() => load());
    const offProgress = base44.entities.StudyProgress.subscribe(() => load());
    return () => {
      offAttendance();
      offProgress();
    };
  }, [load]);

  if (!stats) {
    return <div className="mt-10 h-32 animate-pulse rounded-[14px] bg-secondary" />;
  }

  const statsById = new Map((stats.members || []).map((member) => [member.user_id, member]));
  const rows = (members || [])
    .filter(
      (member, index, list) =>
        member?.user_id && list.findIndex((item) => item?.user_id === member.user_id) === index
    )
    .map((member) => ({
      name: member.name,
      ...(statsById.get(member.user_id) || {}),
      lessons_total: stats.lessons_total,
    }))
    .filter((member) => member.attended !== undefined)
    .sort((a, b) => {
      const earnedA = evaluateBadges(a).filter((badge) => badge.earned).length;
      const earnedB = evaluateBadges(b).filter((badge) => badge.earned).length;
      return (
        earnedB - earnedA ||
        b.lessons_done - a.lessons_done ||
        (a.name || '').localeCompare(b.name || '')
      );
    });

  if (rows.length === 0) return null;

  const totalEarned = rows.reduce(
    (sum, row) => sum + evaluateBadges(row).filter((badge) => badge.earned).length,
    0
  );

  return (
    <section className="mt-10 border-t border-border/80 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Badges</p>
          <h2 className="mt-3 text-[clamp(1.3rem,3vw,1.7rem)] leading-tight">
            Shown up, kept going.
          </h2>
          <p className="mt-2 max-w-[470px] text-[13.5px] leading-relaxed text-muted-foreground">
            Earned by checking in to sessions and finishing lessons. Every member can still earn
            every badge.
          </p>
        </div>
        <p className="text-[11px] tabular-nums uppercase tracking-[0.12em] text-muted-foreground">
          {totalEarned} badge{totalEarned === 1 ? '' : 's'} earned
        </p>
      </div>

      <ul className="mt-5 divide-y divide-border/70 border-y border-border/70">
        {rows.map((row) => (
          <MemberBadgeRow
            key={row.user_id}
            member={row}
            isYou={row.user_id === user?.id}
            isHost={row.user_id === group.created_by_id}
          />
        ))}
      </ul>

      <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
        Check in on a session below once your group has met. Attendance streaks count sessions you
        were there for.
      </p>
    </section>
  );
}