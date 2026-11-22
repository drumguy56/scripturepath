import { BookOpen, CalendarCheck, Flame, GraduationCap, Sparkles } from 'lucide-react';

// Badges are earned from two things a member actually does: turning up to
// sessions and finishing lessons. Each badge names the stat it reads.
export const BADGES = [
  {
    id: 'first_step',
    label: 'First Step',
    note: 'Finished a first lesson',
    metric: 'lessons_done',
    target: 1,
    icon: BookOpen,
  },
  {
    id: 'pressing_on',
    label: 'Pressing On',
    note: 'Five lessons finished',
    metric: 'lessons_done',
    target: 5,
    icon: BookOpen,
  },
  {
    id: 'deep_roots',
    label: 'Deep Roots',
    note: 'Ten lessons finished',
    metric: 'lessons_done',
    target: 10,
    icon: BookOpen,
  },
  {
    id: 'whole_study',
    label: 'Whole Study',
    note: 'Every lesson in this study',
    metric: 'lessons_done',
    target: (stats) => stats.lessons_total || 0,
    icon: GraduationCap,
  },
  {
    id: 'showed_up',
    label: 'Showed Up',
    note: 'Checked in to a first session',
    metric: 'attended',
    target: 1,
    icon: CalendarCheck,
  },
  {
    id: 'in_rhythm',
    label: 'In Rhythm',
    note: 'Three sessions in a row',
    metric: 'streak',
    target: 3,
    icon: Flame,
  },
  {
    id: 'steady_faithful',
    label: 'Steady Faithful',
    note: 'Six sessions in a row',
    metric: 'streak',
    target: 6,
    icon: Flame,
  },
  {
    id: 'ever_present',
    label: 'Ever Present',
    note: 'Ten sessions attended',
    metric: 'attended',
    target: 10,
    icon: Sparkles,
  },
];

export function evaluateBadges(stats) {
  return BADGES.map((badge) => {
    const target = typeof badge.target === 'function' ? badge.target(stats) : badge.target;
    const value = stats?.[badge.metric] || 0;
    return {
      ...badge,
      target,
      current: Math.max(0, Math.min(value, target)),
      earned: target > 0 && value >= target,
    };
  });
}

// The unearned badge the member is closest to, to show what is next.
export function nextBadge(badges) {
  const open = badges.filter((badge) => !badge.earned && badge.target > 0);
  if (open.length === 0) return null;
  return open.sort((a, b) => b.current / b.target - a.current / a.target)[0];
}