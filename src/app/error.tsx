"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 font-display text-2xl font-medium">We couldn&apos;t load this workspace.</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">Your information is safe. Try loading this section again.</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-xl bg-[var(--accent)] px-5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Try again</button>
    </div>
  );
}
