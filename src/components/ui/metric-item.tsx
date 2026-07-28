export function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-[var(--border)] px-4 py-1 last:border-r-0 sm:px-6">
      <strong className="font-display text-xl font-medium tracking-[-0.03em] sm:text-2xl">{value}</strong>
      <span className="mt-1 block text-[0.78rem] leading-5 text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}
