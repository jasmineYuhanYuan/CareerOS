export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-xl bg-[var(--surface-subtle)] ${className}`} />;
}

export function PageSkeleton() {
  return <div role="status" aria-label="Loading page"><Skeleton className="h-3 w-28" /><Skeleton className="mt-4 h-11 w-2/3 max-w-lg" /><Skeleton className="mt-3 h-5 w-1/2 max-w-md" /><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="surface-card p-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-4 h-7 w-4/5" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-8 h-10 w-28" /></div>)}</div><span className="sr-only">Loading</span></div>;
}
