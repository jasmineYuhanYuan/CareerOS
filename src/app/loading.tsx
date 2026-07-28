export default function Loading() {
  return (
    <div role="status" aria-label="Loading page" className="animate-pulse">
      <div className="h-3 w-32 rounded-full bg-[var(--border)]" />
      <div className="mt-4 h-10 w-2/3 max-w-md rounded-xl bg-[var(--border)]" />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="h-64 rounded-[1.35rem] bg-[var(--surface-subtle)]" />
        <div className="h-64 rounded-[1.35rem] bg-[var(--surface-subtle)]" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
