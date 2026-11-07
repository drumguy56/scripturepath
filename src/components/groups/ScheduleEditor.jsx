import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const fieldClass =
  'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13.5px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export default function ScheduleEditor({ group, onSaved }) {
  const [start, setStart] = useState(group.schedule_start || '');
  const [time, setTime] = useState(group.schedule_time || '19:00');
  const [cadence, setCadence] = useState(group.schedule_cadence || 'Weekly');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (event) => {
    event.preventDefault();
    if (!start) {
      setError('Pick the date of your first session.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await base44.entities.StudyGroup.update(group.id, {
        schedule_start: start,
        schedule_time: time,
        schedule_cadence: cadence,
      });
      onSaved({ start, time, cadence });
    } catch {
      setError('Could not save the schedule. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="mt-5 rounded-[14px] border border-border/80 bg-card/40 p-5">
      <p className="eyebrow">Schedule</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            First session
          </span>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={`mt-1.5 ${fieldClass}`}
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Start time
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`mt-1.5 ${fieldClass}`}
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            How often
          </span>
          <select
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
            className={`mt-1.5 ${fieldClass}`}
          >
            <option value="Weekly">Weekly</option>
            <option value="Every other week">Every other week</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full border border-foreground bg-foreground px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-background disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save schedule'}
        </button>
        {error && <p className="text-[12.5px] text-destructive">{error}</p>}
      </div>
    </form>
  );
}