import { FeaturePage } from "@/components/pages/feature-page";
export default function JobsPage() {
  return <FeaturePage eyebrow="Opportunities" title="Jobs" description="Build a focused shortlist of roles worth your time." emptyIcon="◇" emptyTitle="No jobs saved yet" emptyDescription="Saved roles will appear here with their source, deadline and fit for your active profile." actionLabel="Go to companies" actionHref="/companies" />;
}
