import type {
  KnowledgeGraph,
  KnowledgeRelationship,
  KnowledgeRelationshipType,
} from "./types";

const relationshipTypes = new Set<KnowledgeRelationshipType>([
  "hires-for", "requires-skill", "prefers-skill", "relevant-certification",
  "offers-programme", "located-in", "regulated-by", "requires-registration",
  "relevant-visa", "interview-process", "uses-assessment", "supports-career",
  "progresses-to", "related-career", "prepares-for", "suitable-for",
  "employer-of", "qualification-for",
]);

function progressionCycle(
  relationship: KnowledgeRelationship,
  relationships: readonly KnowledgeRelationship[],
): boolean {
  if (relationship.relationshipType !== "progresses-to") return false;
  return relationships.some((candidate) =>
    candidate.relationshipType === "progresses-to"
    && candidate.sourceEntityId === relationship.targetEntityId
    && candidate.targetEntityId === relationship.sourceEntityId,
  );
}

export function validateKnowledgeGraph(graph: KnowledgeGraph): string[] {
  const errors: string[] = [];
  const entityIds = new Set<string>();
  const sourceIds = new Set(graph.sources.map((source) => source.id));

  for (const entity of graph.entities) {
    if (entityIds.has(entity.id)) errors.push(`${entity.id}: duplicate entity ID`);
    entityIds.add(entity.id);
  }

  const relationshipIds = new Set<string>();
  for (const relationship of graph.relationships) {
    if (relationshipIds.has(relationship.id)) errors.push(`${relationship.id}: duplicate relationship ID`);
    relationshipIds.add(relationship.id);
    if (!entityIds.has(relationship.sourceEntityId) || !entityIds.has(relationship.targetEntityId)) {
      errors.push(`${relationship.id}: orphaned relationship`);
      continue;
    }
    if (!relationshipTypes.has(relationship.relationshipType)) errors.push(`${relationship.id}: invalid relationship type`);
    if (relationship.strength < 0 || relationship.strength > 100) errors.push(`${relationship.id}: strength must be 0–100`);
    if (!relationship.rationale.trim() || relationship.evidenceSourceIds.length === 0) errors.push(`${relationship.id}: missing evidence`);
    if (relationship.evidenceSourceIds.some((id) => !sourceIds.has(id))) errors.push(`${relationship.id}: unknown evidence source`);
    const source = graph.entities.find((entity) => entity.id === relationship.sourceEntityId);
    const target = graph.entities.find((entity) => entity.id === relationship.targetEntityId);
    if (source?.verificationStatus === "Archived" || target?.verificationStatus === "Archived") {
      errors.push(`${relationship.id}: relationship points to archived entity`);
    }
    if (progressionCycle(relationship, graph.relationships)) errors.push(`${relationship.id}: circular progression`);
  }
  return errors;
}
