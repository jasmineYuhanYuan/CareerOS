"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-[1.35rem] border border-[#efc3b3] bg-[#fff8f4] px-6 py-12 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a14728]">Something went wrong</p>
      <h1 className="mt-3 font-display text-2xl font-extrabold">We couldn&apos;t load this workspace.</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68736c]">Your information is safe. Try loading this section again.</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 rounded-xl bg-[#245b45] px-5 text-sm font-bold text-white">Try again</button>
    </div>
  );
}
