import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import MemberProgressRow from '@/components/groups/MemberProgressRow';

const STAGGER = 90;
const BAR_DELAY = 120;
const BAR_DUR = 900;

export default function MemberProgress({ groupId, members, ownerId }) {
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [reveal, setReveal] = useState(null);
  const [armed, setArmed] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await base44.functions.invoke('groupProgress', { group_id: groupId });
      if (!active) return;
      const counts = res.data?.completed || {};
      const seen = new Set();
      const list = (members || [])
        .filter((m) => m?.user_id && !seen.has(m.user_id) && seen.add(m.user_id))
        .map((m) => ({ ...m, completed: counts[m.user_id] || 0 }));
      setTotal(res.data?.total || 0);
      setRows(list);
    })();
    return () => {
      active = false;
    };
  }, [groupId]);

  const last = rows ? (rows.length - 1) * STAGGER + BAR_DELAY + BAR_DUR : 0;

  useEffect(() => {
    if (!rows || rows.length === 0 || total === 0 || !rootRef.current) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still || !('IntersectionObserver' in window)) return;

    let raf = 0;
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const frame = (now) => {
          const elapsed = now - t0;
          if (elapsed >= last) {
            setReveal(null);
            setArmed(false);
            return;
          }
          setReveal(elapsed);
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.3 }
    );
    io.observe(rootRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [rows, total, last]);

  if (!rows) {
    return <div className="mt-6 h-28 w-full max-w-[450px] animate-pulse rounded-[10px] bg-secondary" />;
  }
  if (total === 0 || rows.length === 0) return null;

  return (
    <div ref={rootRef} className="mt-7 w-full max-w-[450px]">
      <p className="eyebrow">Lesson progress</p>
      <ol className="mt-4 list-none p-0">
        {rows.map((row, index) => (
          <MemberProgressRow
            key={row.user_id}
            member={row}
            index={index}
            total={total}
            completed={row.completed}
            isHost={row.user_id === ownerId}
            reveal={armed ? reveal || 0 : null}
          />
        ))}
      </ol>
    </div>
  );
}