"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/form-field";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/providers/toast-provider";
import { useCareerOS } from "@/providers/careeros-provider";
import { useLanguage } from "@/providers/language-provider";
import type {
  ApplicationMaterialStatus,
  ApplicationStatus,
  ApplicationSource,
  InterviewSessionStatus,
  InterviewSessionType,
  JobApplication,
} from "@/types/domain";
import { applicationAnalytics } from "@/lib/application-pipeline";
import { displayUiValue } from "@/i18n/presentation";
import { ApplicationFilters, ApplicationMetrics } from "./application-overview";
import { QuickApplicationImport } from "./quick-application-import";
import { documentHasRealFile } from "@/lib/document-evidence";
import { applicationSources, applicationStatuses as statuses, applicationStatusTone, initialStatusHistory, suggestedNextAction } from "@/lib/application-status";
const materialStatuses: ApplicationMaterialStatus[] = [
  "Missing",
  "Draft",
  "Review needed",
  "Ready",
  "Submitted",
  "Outdated",
  "Not applicable",
];

function timestamp(): string {
  return new Date().toISOString();
}

function emptyApplication(profileId: string): JobApplication {
  const createdAt = timestamp();
  return {
    id: "",
    profileId,
    jobId: "",
    organisationName: "",
    jobTitle: "",
    status: "Interested",
    source: "Other",
    savedAt: createdAt,
    appliedAt: "",
    nextAction: "",
    nextActionDate: "",
    cvVersion: "",
    notes: "",
    lastUpdatedAt: createdAt,
    activity: [
      {
        id: `activity-${Date.now()}`,
        type: "created",
        label: "Application created",
        occurredAt: createdAt,
      },
    ],
    statusHistory: initialStatusHistory("Interested", createdAt),
    materials: [
      {
        id: `material-resume-${Date.now()}`,
        label: "Résumé / CV",
        status: "Missing",
        notes: "",
      },
      {
        id: `material-cover-${Date.now()}`,
        label: "Cover letter",
        status: "Missing",
        notes: "",
      },
    ],
    sessions: [],
  };
}

export function ApplicationTracker() {
  const {
    activeWorkspace,
    createApplication,
    updateApplication,
    deleteApplication,
  } = useCareerOS();
  const { t, language } = useLanguage();
  const zh = language === "zh-CN";
  const { notify } = useToast();
  const [view, setView] = useState<"Board" | "List">("Board");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [draft, setDraft] = useState<JobApplication | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(
    () =>
      activeWorkspace.applications.filter(
        (application) =>
          `${application.organisationName} ${application.jobTitle}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === "All" || application.status === statusFilter),
      ),
    [activeWorkspace.applications, query, statusFilter],
  );
  const analytics = applicationAnalytics(activeWorkspace.applications);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.organisationName.trim() || !draft.jobTitle.trim()) {
      setError(t("applications.validation"));
      return;
    }
    const previous = activeWorkspace.applications.find(
      (item) => item.id === draft.id,
    );
    const activity = [...draft.activity];
    const at = timestamp();
    if (previous && previous.status !== draft.status)
      activity.push({
        id: `activity-${Date.now()}-status`,
        type: "status_changed",
        label: `Status changed to ${draft.status}`,
        occurredAt: at,
      });
    if (previous && previous.notes !== draft.notes)
      activity.push({
        id: `activity-${Date.now()}-notes`,
        type: "notes_updated",
        label: "Notes updated",
        occurredAt: at,
      });
    if (
      previous &&
      (previous.nextAction !== draft.nextAction ||
        previous.nextActionDate !== draft.nextActionDate)
    )
      activity.push({
        id: `activity-${Date.now()}-next`,
        type: "next_action_updated",
        label: "Next action updated",
        occurredAt: at,
      });
    const ready = {
      ...draft,
      id: draft.id || `manual-${Date.now()}`,
      lastUpdatedAt: at,
      activity,
    };
    if (previous) updateApplication(ready);
    else {
      createApplication(ready);
      notify(t("feedback.applicationCreated"));
    }
    setDraft(null);
    setError("");
  }

  const editor = (
    <Dialog
      open={draft !== null}
      title={draft?.id ? t("applications.edit") : t("applications.create")}
      description={t("applications.description")}
      onClose={() => setDraft(null)}
    >
      {draft && (
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={zh ? "机构" : "Organisation"} error={error}>
              <Input
                required
                value={draft.organisationName}
                onChange={(e) =>
                  setDraft({ ...draft, organisationName: e.target.value })
                }
              />
            </Field>
            <Field label={zh ? "岗位名称" : "Role title"}>
              <Input
                required
                value={draft.jobTitle}
                onChange={(e) =>
                  setDraft({ ...draft, jobTitle: e.target.value })
                }
              />
            </Field>
            <Field label={zh ? "状态" : "Status"}>
              <Select
                value={draft.status}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    status: e.target.value as ApplicationStatus,
                    nextAction: suggestedNextAction(e.target.value as ApplicationStatus),
                  })
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {displayUiValue(status, language)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={zh ? "来源" : "Source"}>
              <Select value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value as ApplicationSource })}>
                {applicationSources.map((source) => <option key={source} value={source}>{displayUiValue(source, language)}</option>)}
              </Select>
            </Field>
            <Field label={t("applications.dateApplied")}>
              <Input
                type="date"
                value={draft.appliedAt}
                onChange={(e) =>
                  setDraft({ ...draft, appliedAt: e.target.value })
                }
              />
            </Field>
            <Field label={t("applications.nextAction")}>
              <Input
                value={draft.nextAction}
                onChange={(e) =>
                  setDraft({ ...draft, nextAction: e.target.value })
                }
              />
            </Field>
            <Field label={t("applications.nextDate")}>
              <Input
                type="date"
                value={draft.nextActionDate}
                onChange={(e) =>
                  setDraft({ ...draft, nextActionDate: e.target.value })
                }
              />
            </Field>
            <Field label={zh ? "简历版本" : "Résumé version"}>
              <Select
                value={draft.cvVersion}
                onChange={(e) => {
                  const selected = activeWorkspace.documents.find((item) => item.id === e.target.value);
                  setDraft({ ...draft, cvVersion: selected?.id ?? "", materials: (draft.materials ?? []).map((material) => /résumé|resume|cv/i.test(material.label) && selected ? { ...material, status: selected.status === "Ready" ? "Ready" : "Review needed", documentId: selected.id, documentSnapshot: { documentId: selected.id, title: selected.name, version: selected.version, fileName: selected.fileName ?? "", storagePath: selected.storagePath ?? "", capturedAt: new Date().toISOString() } } : material) });
                }}
              ><option value="">{zh ? "选择已上传简历" : "Select uploaded résumé"}</option>{activeWorkspace.documents.filter((item) => documentHasRealFile(item) && /résumé/i.test(item.documentType)).map((item) => <option key={item.id} value={item.id}>{item.name} · {item.version}</option>)}</Select>
            </Field>
          </div>
          <Field label={zh ? "备注" : "Notes"}>
            <Textarea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </Field>
          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">
                {zh ? "申请材料" : "Application materials"}
              </h3>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setDraft({
                    ...draft,
                    materials: [
                      ...(draft.materials ?? []),
                      {
                        id: `material-${Date.now()}`,
                        label: zh ? "新材料" : "New material",
                        status: "Missing",
                        notes: "",
                      },
                    ],
                  })
                }
              >
                {zh ? "添加材料" : "Add material"}
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {(draft.materials ?? []).map((material, index) => (
                <div
                  key={material.id}
                  className="grid gap-3 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-[1fr_12rem_auto]"
                >
                  <Input
                    aria-label={zh ? "材料名称" : "Material name"}
                    value={material.label}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        materials: (draft.materials ?? []).map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, label: event.target.value }
                              : item,
                        ),
                      })
                    }
                  />
                  <Select
                    aria-label={zh ? `${material.label}准备状态` : `${material.label} readiness`}
                    value={material.status}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        materials: (draft.materials ?? []).map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  status: event.target
                                    .value as ApplicationMaterialStatus,
                                }
                              : item,
                        ),
                      })
                    }
                  >
                    {materialStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        materials: (draft.materials ?? []).filter(
                          (item) => item.id !== material.id,
                        ),
                      })
                    }
                  >
                    {zh ? "移除" : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              {zh
                ? "草稿和待审核材料不会计为已就绪。"
                : "Draft and Review needed never count as Ready."}
            </p>
          </section>
          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">{zh ? "面试与笔试安排" : "Interview and assessment sessions"}</h3>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setDraft({
                    ...draft,
                    sessions: [
                      ...(draft.sessions ?? []),
                      {
                        id: `session-${Date.now()}`,
                        type: "Interview",
                        provider: "",
                        stage: "",
                        scheduledAt: "",
                        durationMinutes: null,
                        status: "Planned",
                        preparationNotes: "",
                        outcomeNotes: "",
                      },
                    ],
                  })
                }
              >
                {zh ? "添加安排" : "Add session"}
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {(draft.sessions ?? []).map((session, index) => (
                <div
                  key={session.id}
                  className="grid gap-3 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-2"
                >
                  <Select
                    aria-label={zh ? "安排类型" : "Session type"}
                    value={session.type}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        sessions: (draft.sessions ?? []).map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  type: event.target
                                    .value as InterviewSessionType,
                                }
                              : item,
                        ),
                      })
                    }
                  >
                    <option value="Interview">{zh ? "面试" : "Interview"}</option>
                    <option value="Online assessment">{zh ? "在线笔试" : "Online assessment"}</option>
                  </Select>
                  <Select
                    aria-label={zh ? "安排状态" : "Session status"}
                    value={session.status}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        sessions: (draft.sessions ?? []).map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  status: event.target
                                    .value as InterviewSessionStatus,
                                }
                              : item,
                        ),
                      })
                    }
                  >
                    {(
                      [
                        "Planned",
                        "Invited",
                        "Completed",
                        "Cancelled",
                      ] as InterviewSessionStatus[]
                    ).map((status) => (
                      <option key={status} value={status}>{displayUiValue(status, language)}</option>
                    ))}
                  </Select>
                  <Input
                    aria-label={zh ? "笔试平台或面试官" : "Provider or interviewer"}
                    placeholder={zh ? "笔试平台或面试官" : "Provider or interviewer"}
                    value={session.provider}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        sessions: (draft.sessions ?? []).map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, provider: event.target.value }
                              : item,
                        ),
                      })
                    }
                  />
                  <Input
                    aria-label={zh ? "轮次" : "Stage"}
                    placeholder={zh ? "轮次" : "Stage"}
                    value={session.stage}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        sessions: (draft.sessions ?? []).map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, stage: event.target.value }
                              : item,
                        ),
                      })
                    }
                  />
                  <Input
                    aria-label={zh ? "安排时间" : "Scheduled time"}
                    type="datetime-local"
                    value={session.scheduledAt}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        sessions: (draft.sessions ?? []).map(
                          (item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, scheduledAt: event.target.value }
                              : item,
                        ),
                      })
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        sessions: (draft.sessions ?? []).filter(
                          (item) => item.id !== session.id,
                        ),
                      })
                    }
                  >
                    {zh ? "移除安排" : "Remove session"}
                  </Button>
                </div>
              ))}
            </div>
          </section>
          {draft.id && (
            <section>
              <h3 className="text-sm font-medium">{zh ? "招聘时间线" : "Recruitment Timeline"}</h3>
              <ol className="relative mt-3 border-l border-[var(--border-strong)] pl-5">
                {draft.statusHistory
                  .slice()
                  .map((event) => (
                    <li
                      key={event.id}
                      className="relative pb-5 text-xs last:pb-0"
                    >
                      <span className="absolute -left-[1.42rem] top-1 size-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)]" />
                      <time
                        dateTime={event.timestamp}
                        className="text-[var(--text-tertiary)]"
                      >
                        {new Date(event.timestamp).toLocaleDateString(zh ? "zh-CN" : "en-AU", { day: "numeric", month: "short" })}
                      </time>
                      <p className="mt-1 font-medium">{displayUiValue(event.status, language)}</p>
                      {event.notes && <p className="mt-1 text-[var(--text-secondary)]">{event.notes}</p>}
                    </li>
                  ))}
                {!statuses.slice(statuses.indexOf(draft.status) + 1).every((status) => ["Rejected", "Withdrawn", "Archived"].includes(status)) && !["Offer Accepted", "Offer Declined", "Rejected", "Withdrawn", "Archived"].includes(draft.status) && <li className="relative text-xs text-[var(--text-tertiary)]"><span className="absolute -left-[1.42rem] top-1 size-2.5 rounded-full border-2 border-[var(--border-strong)] bg-[var(--surface)]" />{zh ? "等待下一步…" : "Pending…"}</li>}
              </ol>
            </section>
          )}
          <div className="flex flex-wrap justify-between gap-2">
            {draft.id ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  if (window.confirm(t("applications.deleteConfirm"))) {
                    deleteApplication(draft.id);
                    setDraft(null);
                  }
                }}
              >
                {t("common.delete")}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDraft(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("applications.save")}</Button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );

  return (
    <div className="page-enter">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeading
          eyebrow={t("applications.eyebrow")}
          title={t("applications.title")}
          description={t("applications.description")}
        />
        <div className="flex flex-wrap gap-2">
          <QuickApplicationImport
            language={language}
            profileId={activeWorkspace.profile.id}
            applications={activeWorkspace.applications}
            onImport={(application) => {
              createApplication(application);
              notify(zh ? "投递记录已导入。" : "Application imported.");
            }}
          />
          <Button
            onClick={() =>
              setDraft(emptyApplication(activeWorkspace.profile.id))
            }
          >
            {t("applications.create")}
          </Button>
        </div>
      </div>
      <ApplicationFilters
        language={language}
        query={query}
        status={statusFilter}
        statuses={statuses}
        view={view}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
        onViewChange={setView}
      />
      <ApplicationMetrics analytics={analytics} language={language} />

      {visible.length === 0 ? (
        <EmptyState
          icon="▤"
          title={t("applications.emptyTitle")}
          description={t("applications.emptyBody")}
          actionLabel={t("applications.create")}
          actionOnClick={() =>
            setDraft(emptyApplication(activeWorkspace.profile.id))
          }
          secondaryLabel={t("applications.browseJobs")}
          secondaryHref="/jobs"
        />
      ) : view === "List" ? (
        <div className="hidden overflow-x-auto rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] md:block">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[var(--surface-subtle)] text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              <tr>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Next action</th>
                <th className="p-4">Date</th>
                <th className="p-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {visible.map((application) => (
                <tr key={application.id}>
                  <td className="p-4">
                    <strong className="font-medium">
                      {application.jobTitle}
                    </strong>
                    <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                      {application.organisationName}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={applicationStatusTone(application.status)}>
                      {displayUiValue(application.status, language)}
                    </StatusBadge>
                  </td>
                  <td className="p-4">{application.nextAction || "Not set"}</td>
                  <td className="p-4">{application.nextActionDate || "—"}</td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDraft(structuredClone(application))}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
          {statuses.map((status) => {
            const items = visible.filter(
              (application) => application.status === status,
            );
            if (items.length === 0) return null;
            return (
              <section
                key={status}
                className="min-w-0 rounded-[1.25rem] bg-[var(--surface-subtle)] p-3"
              >
                <h2 className="flex items-center justify-between p-2 text-sm font-medium">
                  {displayUiValue(status, language)}
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {items.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {items.map((application) => (
                    <button
                      type="button"
                      key={application.id}
                      onClick={() => setDraft(structuredClone(application))}
                      className="min-h-24 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-colors hover:border-[var(--accent)]"
                    >
                      <strong className="block text-sm font-medium">
                        {application.jobTitle}
                      </strong>
                      <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                        {application.organisationName}
                      </span>
                      {application.nextAction && (
                        <span className="mt-3 block text-xs font-medium text-[var(--text-secondary)]">
                          Next: {application.nextAction}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {visible.length > 0 && (
        <div className="space-y-6 md:hidden">
          {statuses.map((status) => {
            const items = visible.filter(
              (application) => application.status === status,
            );
            if (items.length === 0) return null;
            return (
              <section key={status}>
                <h2 className="mb-2 flex items-center justify-between text-sm font-medium">
                  {displayUiValue(status, language)}
                  <span className="text-[var(--text-tertiary)]">
                    {items.length}
                  </span>
                </h2>
                <div className="divide-y divide-[var(--border)] rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)]">
                  {items.map((application) => (
                    <button
                      type="button"
                      key={application.id}
                      onClick={() => setDraft(structuredClone(application))}
                      className="block min-h-20 w-full p-4 text-left"
                    >
                      <strong className="block font-medium">
                        {application.jobTitle}
                      </strong>
                      <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                        {application.organisationName}
                      </span>
                      {application.nextAction && (
                        <span className="mt-2 block text-xs text-[var(--text-secondary)]">
                          Next: {application.nextAction}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {editor}
    </div>
  );
}
