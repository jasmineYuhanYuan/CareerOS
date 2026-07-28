import { FeaturePage } from "@/components/pages/feature-page";
export default function ApplicationsPage() {
  return <FeaturePage eyebrow="Tracker" title="Applications" description="Follow every opportunity from saved to offer, with a clear next action." emptyIcon="✓" emptyTitle="Your tracker is clear" emptyDescription="When you start an application, it will appear here with its status, deadline and next action." actionLabel="Browse saved jobs" actionHref="/jobs" />;
}
