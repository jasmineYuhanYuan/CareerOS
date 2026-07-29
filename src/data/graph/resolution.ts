import type { KnowledgeEntity } from "./types";

export function normaliseEntityName(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim();
}

const canonicalAliases: Record<string, string[]> = {
  "Commonwealth Bank": ["CBA", "CommBank", "Commonwealth Bank of Australia"],
  Ahpra: ["AHPRA", "Australian Health Practitioner Regulation Agency"],
  "Canberra / ACT": ["ACT", "Australian Capital Territory", "Canberra region", "Canberra"],
};

export function aliasesFor(name: string): string[] {
  return canonicalAliases[name] ?? [];
}

export function resolveEntity(
  query: string,
  entities: readonly KnowledgeEntity[],
): KnowledgeEntity | undefined {
  const needle = normaliseEntityName(query);
  return entities.find((entity) =>
    [entity.name, ...entity.aliases].some(
      (candidate) => normaliseEntityName(candidate) === needle,
    ),
  );
}
