export default function BadgeChip({ badge }) {
  const Icon = badge.icon;
  return (
    <span
      title={badge.note}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.1em] text-primary"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {badge.label}
    </span>
  );
}