import { easeSc8 } from '@/lib/ease';

const STAGGER = 90;
const BAR_DELAY = 120;
const BAR_DUR = 900;
const COUNT_DUR = 620;
const RULE_DELAY = 300;
const RULE_DUR = 600;

// One per-row triplet: tag tint, tag ink, bar fill.
const TONES = {
  host: {
    tagBg: 'hsl(var(--primary) / 0.16)',
    tagInk: 'hsl(var(--primary))',
    fill: 'hsl(var(--primary))',
  },
  member: {
    tagBg: 'hsl(var(--foreground) / 0.14)',
    tagInk: 'hsl(var(--foreground))',
    fill: 'hsl(var(--foreground) / 0.85)',
  },
};

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const progress = (t, delay, duration) => (t === null ? 1 : easeSc8(clamp01((t - delay) / duration)));

export default function MemberProgressRow({ member, index, total, completed, isHost, reveal }) {
  const start = index * STAGGER;
  const tone = isHost ? TONES.host : TONES.member;
  const rise = progress(reveal, start, 500);
  const fill = progress(reveal, start + BAR_DELAY, BAR_DUR);
  const counted = progress(reveal, start + BAR_DELAY, COUNT_DUR);
  const rule = progress(reveal, start + RULE_DELAY, RULE_DUR);
  const pct = Math.round((completed / total) * 100);
  const shown = Math.round(completed * counted);

  return (
    <li className={`relative ${index === 0 ? '' : 'mt-6 pt-6'}`}>
      {index > 0 && (
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 top-0 h-px origin-left bg-border"
          style={{ transform: `scaleX(${rule})` }}
        />
      )}

      <div
        style={{
          opacity: rise,
          transform: `translateY(${(1 - rise) * 6}px)`,
        }}
      >
        <span
          className="inline-block rounded-[2px] px-[0.58em] pb-[0.44em] pt-[0.43em] font-mono text-[11px] leading-none"
          style={{ background: tone.tagBg, color: tone.tagInk }}
        >
          {isHost ? 'Host' : 'Member'}
        </span>

        <div className="mt-3 flex items-baseline justify-between gap-4">
          <h3 className="min-w-0 truncate font-heading text-[clamp(1.02rem,2.1vw,1.35rem)] font-normal leading-none text-foreground">
            {member.name || 'Member'}
          </h3>
          <p className="shrink-0 whitespace-nowrap font-heading text-[clamp(1.02rem,2.1vw,1.35rem)] font-normal leading-none tabular-nums text-foreground">
            {shown}
            <span className="ml-1.5 text-[0.6em] text-muted-foreground">/ {total}</span>
          </p>
        </div>

        <div
          role="meter"
          aria-label={`${member.name || 'Member'}: ${completed} of ${total} lessons completed`}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completed}
          className="mt-4 h-[10px] w-full overflow-hidden bg-transparent"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, hsl(var(--foreground) / 0.35) 0 1.7px, transparent 1.7px 6.364px)',
          }}
        >
          <span
            className="block h-full origin-left"
            style={{
              width: `${pct}%`,
              background: tone.fill,
              transform: `scaleX(${fill})`,
            }}
          />
        </div>
      </div>
    </li>
  );
}