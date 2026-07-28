import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";

interface FeaturePageProps {
  eyebrow: string;
  title: string;
  description: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel?: string;
  actionHref?: string;
}

export function FeaturePage(props: FeaturePageProps) {
  return (
    <>
      <PageHeading eyebrow={props.eyebrow} title={props.title} description={props.description} />
      <EmptyState icon={props.emptyIcon} title={props.emptyTitle} description={props.emptyDescription} actionLabel={props.actionLabel} actionHref={props.actionHref} />
    </>
  );
}
