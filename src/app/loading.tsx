export default function Loading() {
  return (
    <div role="status" aria-label="Loading page" className="animate-pulse">
      <div className="h-3 w-32 rounded-full bg-[#dedfd7]" />
      <div className="mt-4 h-10 w-2/3 max-w-md rounded-xl bg-[#dedfd7]" />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="h-64 rounded-[1.35rem] bg-[#e8e8e0]" />
        <div className="h-64 rounded-[1.35rem] bg-[#e8e8e0]" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
