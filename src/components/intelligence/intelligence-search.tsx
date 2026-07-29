"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input, Select } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { intelligenceCoverage } from "@/data/intelligence";
import { intelligenceSearchIndex, searchIntelligence } from "@/data/intelligence/search";
import type { IntelligenceDomain } from "@/data/intelligence/types";
import { useLanguage } from "@/providers/language-provider";

export function IntelligenceSearch() {
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<IntelligenceDomain | "All">("All");
  const domains = useMemo(() => Array.from(new Set(intelligenceSearchIndex.map((record) => record.domain))).sort(), []);
  const results = useMemo(() => searchIntelligence(query, domain), [domain, query]);

  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={zh ? "已核验职业知识" : "Verified career knowledge"}
        title={zh ? "Career Intelligence 搜索" : "Career Intelligence search"}
        description={zh ? "跨公司、职位、大学、认证、签证、医疗职业、面试和注册信息搜索。未知字段不会被推测补全。" : "Search companies, jobs, universities, certifications, visas, healthcare, interviews and registration. Unknown fields are never inferred."}
      />
      <section className="surface-card mb-7 grid gap-4 p-5 md:grid-cols-[1fr_16rem]">
        <label><span className="sr-only">{zh ? "搜索职业知识" : "Search career intelligence"}</span><Input type="search" className="!mt-0" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={zh ? "搜索公司、职业、认证、签证……" : "Search companies, careers, certifications, visas…"} /></label>
        <label><span className="sr-only">{zh ? "数据类型" : "Knowledge domain"}</span><Select className="!mt-0" value={domain} onChange={(event) => setDomain(event.target.value as IntelligenceDomain | "All")}><option>All</option>{domains.map((value) => <option key={value}>{value}</option>)}</Select></label>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-8">
        {Object.entries(intelligenceCoverage).map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><strong className="block text-xl">{value}</strong><span className="text-[var(--text-tertiary)]">{label}</span></div>)}
      </div>

      <p className="mb-4 text-sm text-[var(--text-secondary)]" aria-live="polite">{results.length} {zh ? "条记录" : results.length === 1 ? "record" : "records"}</p>
      {results.length === 0 ? <p className="surface-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">{zh ? "没有匹配记录。未收录不代表不存在。" : "No matching records. Absence from this verified index does not mean an option does not exist."}</p> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((record) => <article key={`${record.domain}-${record.id}`} className="surface-card flex flex-col p-5">
            <div className="flex flex-wrap gap-2"><StatusBadge status="positive">{record.domain}</StatusBadge><StatusBadge>{record.sourceType}</StatusBadge></div>
            <h2 className="mt-4 font-display text-xl font-medium leading-snug">{record.title}</h2>
            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">{record.subtitle}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{record.summary || (zh ? "官方来源未发布摘要" : "No summary published by the official source")}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-xs">
              <div><dt className="text-[var(--text-tertiary)]">{zh ? "核验日期" : "Verified"}</dt><dd className="mt-1">{record.lastVerified}</dd></div>
              <div><dt className="text-[var(--text-tertiary)]">{zh ? "置信度" : "Confidence"}</dt><dd className="mt-1">{record.confidence}</dd></div>
            </dl>
            <a href={record.officialUrl} target="_blank" rel="noreferrer" className="mt-auto inline-flex min-h-11 items-end pt-4 text-sm font-medium text-[var(--accent)]">{zh ? "打开来源" : "Open source"} ↗</a>
            <Link href={`/knowledge-graph?entity=${encodeURIComponent(record.id)}`} className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)]">{zh ? "查看知识连接" : "View knowledge connections"} →</Link>
          </article>)}
        </div>
      )}
    </div>
  );
}
