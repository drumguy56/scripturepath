export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function sessionIntervalDays(cadence: string): number {
  return cadence === "Every other week" ? 14 : 7;
}

export function buildSessions(group: any, lessons: any[]): any[] {
  if (!group || !group.schedule_start) return [];
  const interval = sessionIntervalDays(group.schedule_cadence);
  const time = group.schedule_time || "19:00";
  return lessons.slice(0, 52).map((lesson, index) => ({
    lesson_id: lesson.id,
    title: lesson.title,
    scripture_reference: lesson.scripture_reference || "",
    date: addDays(group.schedule_start, index * interval),
    time,
  }));
}

export function eventTimes(session: any): { start: string; end: string } {
  const start = new Date(`${session.date}T${session.time}:00Z`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    start: `${session.date}T${session.time}:00`,
    end: end.toISOString().slice(0, 19),
  };
}