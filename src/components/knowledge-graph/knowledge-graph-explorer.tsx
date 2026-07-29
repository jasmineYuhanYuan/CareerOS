"use client";

import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  careerKnowledgeGraph,
  connectionsFor,
  entityById,
  knowledgeEntities,
} from "@/data/graph";
import type {
  KnowledgeEntityType,
  KnowledgeRelationshipType,
} from "@/data/graph/types";
import { useLanguage } from "@/providers/language-provider";

export function KnowledgeGraphExplorer({ initialEntityId = "" }: { initialEntityId?: string }) {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState<KnowledgeEntityType | "All">("All");
  const [relationshipType, setRelationshipType] = useState<KnowledgeRelationshipType | "All">("All");
  const [verification, setVerification] = useState("Verified");
  const [selectedId, setSelectedId] = useState(
    entityById(initialEntityId)?.id ?? knowledgeEntities[0]?.id ?? "",
  );

  const entityTypes = useMemo(
    () => Array.from(new Set(knowledgeEntities.map((entity) => entity.type))).sort(),
    [],
  );
  const relationshipTypes = useMemo(
    () => Array.from(new Set(careerKnowledgeGraph.relationships.map((item) => item.relationshipType))).sort(),
    [],
  );
  const filtered = useMemo(() => knowledgeEntities.filter((entity) => {
    if (entityType !== "All" && entity.type !== entityType) return false;
    if (verification !== "All" && entity.verificationStatus !== verification) return false;
    return [entity.name, entity.description, ...entity.aliases].join(" ").toLowerCase().includes(query.toLowerCase());
  }), [entityType, query, verification]);
  const selected = entityById(selectedId);
  const relationships = selected
    ? connectionsFor(selected.id).filter((item) => relationshipType === "All" || item.relationshipType === relationshipType)
    : [];
  const sources = Array.from(new Set([
    ...(selected?.sourceIds ?? []),
    ...relationships.flatMap((item) => item.evidenceSourceIds),
  ])).map((id) => careerKnowledgeGraph.sources.find((source) => source.id === id)).filter(Boolean);

  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={zh ? "Sprint 7 · 可追溯关系" : "Sprint 7 · Traceable relationships"}
        title={zh ? "职业知识图谱" : "Career knowledge graph"}
        description={zh ? "浏览已核验实体之间的关系。关系强度表示证据直接程度，不是推荐分数。" : "Explore connections between verified entities. Relationship strength reflects evidence directness, not a recommendation score."}
      />
      <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_19rem]">
        <aside className="surface-card self-start p-4" aria-label={zh ? "知识图谱筛选" : "Knowledge graph filters"}>
          <label className="block text-sm font-medium">{zh ? "搜索实体" : "Search entities"}<Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className="mt-4 block text-sm font-medium">{zh ? "实体类型" : "Entity type"}<Select value={entityType} onChange={(event) => setEntityType(event.target.value as KnowledgeEntityType | "All")}><option>All</option>{entityTypes.map((value) => <option key={value}>{value}</option>)}</Select></label>
          <label className="mt-4 block text-sm font-medium">{zh ? "关系类型" : "Relationship type"}<Select value={relationshipType} onChange={(event) => setRelationshipType(event.target.value as KnowledgeRelationshipType | "All")}><option>All</option>{relationshipTypes.map((value) => <option key={value}>{value}</option>)}</Select></label>
          <label className="mt-4 block text-sm font-medium">{zh ? "核验状态" : "Verification"}<Select value={verification} onChange={(event) => setVerification(event.target.value)}><option>All</option><option>Verified</option><option>Partially verified</option></Select></label>
          <p className="mt-5 text-xs text-[var(--text-tertiary)]" aria-live="polite">{filtered.length} {zh ? "个实体" : "entities"}</p>
          <div className="mt-3 max-h-[34rem] space-y-1 overflow-y-auto">
            {filtered.map((entity) => <button key={entity.id} type="button" onClick={() => setSelectedId(entity.id)} aria-pressed={selectedId === entity.id} className={`w-full rounded-lg px-3 py-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${selectedId === entity.id ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "hover:bg-[var(--surface-subtle)]"}`}><span className="block font-medium">{entity.name}</span><span className="mt-1 block text-xs opacity-70">{entity.type}</span></button>)}
          </div>
        </aside>

        <main className="min-w-0">
          {!selected ? <p className="surface-card border-dashed p-10 text-center">{zh ? "请选择实体。" : "Select an entity."}</p> : <>
            <section className="surface-card p-6">
              <div className="flex flex-wrap gap-2"><StatusBadge status="positive">{selected.verificationStatus}</StatusBadge><StatusBadge>{selected.type}</StatusBadge><StatusBadge>{selected.confidence}</StatusBadge></div>
              <h2 className="mt-4 font-display text-3xl font-medium">{selected.name}</h2>
              <p className="mt-3 leading-7 text-[var(--text-secondary)]">{selected.description}</p>
              <p className="mt-4 text-xs text-[var(--text-tertiary)]">{zh ? "最后核验" : "Last verified"}: {selected.lastVerified}</p>
            </section>
            <section className="mt-5" aria-labelledby="connections-heading">
              <h2 id="connections-heading" className="mb-3 font-display text-xl font-medium">{zh ? "已核验连接" : "Verified connections"}</h2>
              {relationships.length === 0 ? <p className="surface-card border-dashed p-8 text-sm text-[var(--text-secondary)]">{zh ? "当前筛选下没有已核验关系。没有关系不代表不存在。" : "No verified relationships match these filters. Absence does not imply no relationship exists."}</p> : <div className="space-y-3">{relationships.map((item) => {
                const outgoing = item.sourceEntityId === selected.id;
                const connected = entityById(outgoing ? item.targetEntityId : item.sourceEntityId);
                return <article key={item.id} className="surface-card p-5">
                  <div className="flex flex-wrap items-center gap-2"><StatusBadge>{item.relationshipType}</StatusBadge><span aria-label={`${zh ? "关系强度" : "Relationship strength"} ${item.strength} of 100`} className="text-sm font-semibold">{item.strength}/100</span></div>
                  <h3 className="mt-3 font-display text-lg font-medium">{outgoing ? "→" : "←"} {connected?.name ?? item.targetEntityId}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.rationale}</p>
                  {item.notes && <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)]">{item.notes}</p>}
                  {connected && <button type="button" onClick={() => setSelectedId(connected.id)} className="mt-3 min-h-11 text-sm font-medium text-[var(--accent)]">{zh ? "打开连接实体" : "Open connected entity"} →</button>}
                </article>;
              })}</div>}
            </section>
          </>}
        </main>

        <aside className="surface-card self-start p-5" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading" className="font-display text-lg font-medium">{zh ? "证据与来源" : "Evidence and sources"}</h2>
          {sources.length === 0 ? <p className="mt-3 text-sm text-[var(--text-secondary)]">{zh ? "没有可显示的来源。" : "No source available."}</p> : <ul className="mt-3 divide-y divide-[var(--border)]">{sources.map((source) => source && <li key={source.id} className="py-4"><p className="text-sm font-medium">{source.label}</p><p className="mt-1 text-xs text-[var(--text-tertiary)]">{source.sourceType} · {source.lastVerified}</p><a className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]" href={source.url} target="_blank" rel="noreferrer">{zh ? "打开官方来源" : "Open source"} ↗</a></li>)}</ul>}
        </aside>
      </div>
    </div>
  );
}
