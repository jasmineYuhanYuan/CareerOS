"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  deleteCareerDocumentFile,
  downloadCareerDocument,
  updateCareerDocumentStatus,
  uploadCareerDocument,
} from "@/lib/document-api";
import { documentHasRealFile } from "@/lib/document-evidence";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import { useToast } from "@/providers/toast-provider";
import type {
  CareerDocumentLanguage,
  CareerDocumentRecord,
  CareerDocumentType,
} from "@/types/domain";

const types: CareerDocumentType[] = [
  "English résumé",
  "Chinese résumé",
  "Cover letter",
  "Portfolio",
  "Academic transcript",
  "Personal statement",
  "Recommendation materials",
  "Other",
];
const languages: CareerDocumentLanguage[] = [
  "English",
  "Chinese",
  "Bilingual",
  "Other",
];
type Draft = {
  title: string;
  documentType: CareerDocumentType;
  language: CareerDocumentLanguage;
  version: string;
  targetMarket: string;
  notes: string;
  isPrimary: boolean;
};
const blank = (): Draft => ({
  title: "",
  documentType: "English résumé",
  language: "English",
  version: "v1",
  targetMarket: "",
  notes: "",
  isPrimary: false,
});

export function DocumentManager() {
  const { activeWorkspace, upsertDocument, deleteDocument } = useCareerOS();
  const { language } = useLanguage();
  const zh = language === "zh-CN";
  const { notify } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const upload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const fields = Object.fromEntries(
        Object.entries(draft).map(([key, value]) => [key, String(value)]),
      );
      const document = await uploadCareerDocument(file, {
        ...fields,
        profileId: activeWorkspace.profile.id,
      });
      upsertDocument(document);
      setOpen(false);
      setFile(null);
      setDraft(blank());
      notify(
        document.parseStatus === "parsed"
          ? zh
            ? "文档已上传并解析。"
            : "Document uploaded and parsed."
          : zh
            ? "文件已上传，但内容解析失败"
            : "File uploaded, but parsing failed.",
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async (document: CareerDocumentRecord) => {
    if (
      !window.confirm(
        zh ? `删除 ${document.name}？` : `Delete ${document.name}?`,
      )
    )
      return;
    try {
      if (documentHasRealFile(document))
        await deleteCareerDocumentFile(document.id);
      deleteDocument(document.id);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Delete failed.");
    }
  };
  const markReady = async (document: CareerDocumentRecord) => {
    try {
      upsertDocument(await updateCareerDocumentStatus(document.id, "Ready"));
    } catch (error) {
      notify(error instanceof Error ? error.message : "Update failed.");
    }
  };
  const groups = [
    [
      zh ? "我的简历" : "My résumés",
      (d: CareerDocumentRecord) => /résumé/i.test(d.documentType),
    ],
    [
      zh ? "作品集" : "Portfolios",
      (d: CareerDocumentRecord) => d.documentType === "Portfolio",
    ],
    [
      zh ? "求职信" : "Cover letters",
      (d: CareerDocumentRecord) => d.documentType === "Cover letter",
    ],
    [
      zh ? "其他材料" : "Other materials",
      (d: CareerDocumentRecord) =>
        !/résumé/i.test(d.documentType) &&
        !["Portfolio", "Cover letter"].includes(d.documentType),
    ],
  ] as const;
  return (
    <div className="page-enter">
      <PageHeading
        eyebrow={zh ? "真实求职材料" : "Real career materials"}
        title={zh ? "文档中心" : "Document Hub"}
        description={
          zh
            ? "安全上传 PDF 或 DOCX。解析内容可作为匹配证据，但不会自动覆盖档案。"
            : "Securely upload PDF or DOCX files. Parsed content becomes evidence without overwriting your profile."
        }
        action={
          <Button onClick={() => setOpen(true)}>
            {zh ? "上传文档" : "Upload document"}
          </Button>
        }
      />
      {activeWorkspace.documents.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="□"
            title={zh ? "尚未上传文档" : "No documents uploaded"}
            description={
              zh
                ? "只有真实上传的文件才能计入材料就绪度。"
                : "Only real uploaded files count toward readiness."
            }
          />
        </div>
      ) : (
        groups.map(([title, matches]) => {
          const records = activeWorkspace.documents.filter(matches);
          return records.length ? (
            <section key={title} className="mt-10">
              <h2 className="font-display text-xl font-medium">{title}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {records.map((document) => {
                  const real = documentHasRealFile(document);
                  return (
                    <article key={document.id} className="surface-card p-5">
                      <div className="flex justify-between gap-3">
                        <div className="flex gap-2">
                          <StatusBadge
                            status={
                              document.status === "Ready"
                                ? "positive"
                                : "neutral"
                            }
                          >
                            {document.status}
                          </StatusBadge>
                          <StatusBadge>
                            {document.parseStatus === "parsed"
                              ? zh
                                ? "已解析"
                                : "Parsed"
                              : real
                                ? zh
                                  ? "解析失败"
                                  : "Parse failed"
                                : zh
                                  ? "仅记录"
                                  : "Record only"}
                          </StatusBadge>
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {document.uploadedAt
                            ? new Date(document.uploadedAt).toLocaleDateString(
                                zh ? "zh-CN" : "en-AU",
                              )
                            : "—"}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-lg font-medium">
                        {document.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {document.documentType} · {document.language ?? "Other"}{" "}
                        · {document.version}
                      </p>
                      <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                        {real
                          ? `${document.fileName} · ${Math.ceil((document.fileSize ?? 0) / 1024)} KB`
                          : zh
                            ? "仅记录，尚未上传文件"
                            : "Record only — file not uploaded"}
                      </p>
                      {document.parseError && (
                        <p className="mt-2 text-sm text-[var(--danger)]">
                          {document.parseError}
                        </p>
                      )}
                      <div className="mt-4 flex gap-1">
                        {real && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              void downloadCareerDocument(
                                document.id,
                                document.fileName ?? document.name,
                              )
                            }
                          >
                            {zh ? "下载" : "Download"}
                          </Button>
                        )}
                        {real &&
                          document.parseStatus === "parsed" &&
                          document.status !== "Ready" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => void markReady(document)}
                            >
                              {zh ? "标记为就绪" : "Mark ready"}
                            </Button>
                          )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void remove(document)}
                        >
                          {zh ? "删除" : "Delete"}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null;
        })
      )}
      <Dialog
        open={open}
        title={zh ? "上传文档" : "Upload document"}
        description={
          zh
            ? "文件保持私有，并在服务器端解析。"
            : "Files remain private and are parsed server-side."
        }
        onClose={() => !busy && setOpen(false)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                setFile(next);
                if (next && !draft.title)
                  setDraft({
                    ...draft,
                    title: next.name.replace(/\.(pdf|docx)$/i, ""),
                  });
              }}
            />
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              PDF / DOCX · 10 MB max
            </p>
          </div>
          <Field label={zh ? "标题" : "Title"}>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label={zh ? "版本" : "Version"}>
            <Input
              value={draft.version}
              onChange={(e) => setDraft({ ...draft, version: e.target.value })}
            />
          </Field>
          <Field label={zh ? "类型" : "Type"}>
            <Select
              value={draft.documentType}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  documentType: e.target.value as CareerDocumentType,
                })
              }
            >
              {types.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </Select>
          </Field>
          <Field label={zh ? "语言" : "Language"}>
            <Select
              value={draft.language}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  language: e.target.value as CareerDocumentLanguage,
                })
              }
            >
              {languages.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </Select>
          </Field>
          <Field label={zh ? "目标市场／方向" : "Target market / role"}>
            <Input
              value={draft.targetMarket}
              onChange={(e) =>
                setDraft({ ...draft, targetMarket: e.target.value })
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.isPrimary}
              onChange={(e) =>
                setDraft({ ...draft, isPrimary: e.target.checked })
              }
            />
            {zh ? "设为主要版本" : "Primary version"}
          </label>
          <div className="sm:col-span-2">
            <Field label={zh ? "备注" : "Notes"}>
              <Textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              {zh ? "取消" : "Cancel"}
            </Button>
            <Button
              disabled={busy || !file || !draft.title.trim()}
              onClick={() => void upload()}
            >
              {busy
                ? zh
                  ? "上传中…"
                  : "Uploading…"
                : zh
                  ? "上传并解析"
                  : "Upload and parse"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
