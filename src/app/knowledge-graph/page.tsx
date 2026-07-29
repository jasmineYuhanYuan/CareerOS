import { KnowledgeGraphExplorer } from "@/components/knowledge-graph/knowledge-graph-explorer";

export default async function KnowledgeGraphPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const { entity } = await searchParams;
  return <KnowledgeGraphExplorer initialEntityId={entity} />;
}
