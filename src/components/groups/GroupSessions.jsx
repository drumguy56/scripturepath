import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { groupAudience } from '@/lib/groupAudience';
import ScheduleEditor from '@/components/groups/ScheduleEditor';
import SessionList from '@/components/groups/SessionList';
import CalendarSyncPanel from '@/components/groups/CalendarSyncPanel';

export default function GroupSessions({ group, isOwner }) {
  const { user } = useAuth();
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
  const [attended, setAttended] = useState(new Set());
  const [checkingId, setCheckingId] = useState(null);
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

  useEffect(() => {
    if (!user?.id) return undefined;
    let active = true;
    (async () => {
      const page = await base44.entities.SessionAttendance.filter(
        { group_id: group.id, user_id: user.id },
        { limit: 200 }
      );
      if (active) setAttended(new Set((page.items || []).map((record) => record.lesson_id)));
    })();
    return () => {
      active = false;
    };
  }, [group.id, user?.id]);

  const checkIn = async (session) => {
    setCheckingId(session.lesson_id);
    try {
      await base44.entities.SessionAttendance.create({
        group_id: group.id,
        lesson_id: session.lesson_id,
        session_date: session.date,
        user_id: user.id,
        user_name: user.full_name || user.email || 'Member',
        members: groupAudience(group, group.member_profiles, user),
      });
      setAttended((current) => new Set(current).add(session.lesson_id));
    } finally {
      setCheckingId(null);
    }
  };

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
          <SessionList
            sessions={sessions}
            attended={attended}
            onCheckIn={checkIn}
            checkingId={checkingId}
          />
          {sessions.length > 0 && <CalendarSyncPanel groupId={group.id} />}
        </>
      )}
    </section>
  );
}