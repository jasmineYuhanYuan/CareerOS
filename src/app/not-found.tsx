import { EmptyState } from "@/components/ui/empty-state";
export default function NotFound() {
  return <EmptyState icon="?" title="This page isn’t on the roadmap" description="The page may have moved, or the address might be incomplete." actionLabel="Return to overview" actionHref="/" />;
}
