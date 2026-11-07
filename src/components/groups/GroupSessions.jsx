import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ScheduleEditor from '@/components/groups/ScheduleEditor';
import SessionList from '@/components/groups/SessionList';
import CalendarSyncPanel from '@/components/groups/CalendarSyncPanel';

export default function GroupSessions({ group, isOwner }) {
  const [sessions, setSessions] = useState([]);
  const [schedule, setSchedule] = useState(
    group.schedule_start
      ? {
          start: group.schedule_start,
          time: group.schedule_time || '19:00',
          cadence: group.schedule_cadence || 'Weekly',
        }
      : null
  );
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await base44.functions.invoke('groupSessions', { group_id: group.id });
    setSchedule(res.data?.schedule || null);
    setSessions(res.data?.sessions || []);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (active) await load();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [group.id]);

  return (
    <section className="mt-10 border-t border-border/80 pt-8">
      <p className="eyebrow">Sessions</p>
      <h2 className="mt-2 text-[20px] leading-snug">When your group meets</h2>

      {isOwner && (
        <ScheduleEditor
          group={group}
          onSaved={(next) => {
            setSchedule(next);
            load();
          }}
        />
      )}

      {loading ? (
        <div className="mt-5 h-24 animate-pulse rounded-[14px] bg-secondary" />
      ) : !schedule ? (
        <p className="mt-4 text-[13.5px] text-muted-foreground">
          {isOwner
            ? 'Set a start date and pace above and every lesson gets its session date.'
            : 'The host has not set a meeting schedule yet.'}
        </p>
      ) : (
        <>
          <p className="mt-4 text-[13px] text-muted-foreground">
            {schedule.cadence} · first session{' '}
            {new Date(`${schedule.start}T00:00:00`).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <SessionList sessions={sessions} />
          {sessions.length > 0 && <CalendarSyncPanel groupId={group.id} />}
        </>
      )}
    </section>
  );
}