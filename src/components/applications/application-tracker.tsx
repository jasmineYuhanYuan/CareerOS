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
  InterviewSessionStatus,
  InterviewSessionType,
  JobApplication,
} from "@/types/domain";
import { applicationAnalytics } from "@/lib/application-pipeline";
import { displayUiValue } from "@/i18n/presentation";

const statuses: ApplicationStatus[] = [
  "Interested",
  "Researching",
  "Preparing",
  "Ready to apply",
  "Applied",
  "OA invited",
  "OA completed",
  "Interview invited",
  "Interviewing",
  "Reference check",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Archived",
];
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
            <Field label="Date applied">
              <Input
                type="date"
                value={draft.appliedAt}
                onChange={(e) =>
                  setDraft({ ...draft, appliedAt: e.target.value })
                }
              />
            </Field>
            <Field label="Next action">
              <Input
                value={draft.nextAction}
                onChange={(e) =>
                  setDraft({ ...draft, nextAction: e.target.value })
                }
              />
            </Field>
            <Field label="Next-action date">
              <Input
                type="date"
                value={draft.nextActionDate}
                onChange={(e) =>
                  setDraft({ ...draft, nextActionDate: e.target.value })
                }
              />
            </Field>
            <Field label="CV version">
              <Input
                value={draft.cvVersion}
                onChange={(e) =>
                  setDraft({ ...draft, cvVersion: e.target.value })
                }
              />
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
                    aria-label="Material name"
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
                    aria-label={`${material.label} readiness`}
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
                    Remove
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
              <h3 className="text-sm font-medium">Interview and OA sessions</h3>
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
                Add session
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {(draft.sessions ?? []).map((session, index) => (
                <div
                  key={session.id}
                  className="grid gap-3 rounded-xl border border-[var(--border)] p-3 sm:grid-cols-2"
                >
                  <Select
                    aria-label="Session type"
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
                    <option>Interview</option>
                    <option>Online assessment</option>
                  </Select>
                  <Select
                    aria-label="Session status"
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
                      <option key={status}>{status}</option>
                    ))}
                  </Select>
                  <Input
                    aria-label="Provider or interviewer"
                    placeholder="Provider or interviewer"
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
                    aria-label="Stage"
                    placeholder="Stage"
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
                    aria-label="Scheduled time"
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
                    Remove session
                  </Button>
                </div>
              ))}
            </div>
          </section>
          {draft.id && (
            <section>
              <h3 className="text-sm font-medium">Activity history</h3>
              <ol className="mt-2 divide-y divide-[var(--border)]">
                {draft.activity
                  .slice()
                  .reverse()
                  .map((event) => (
                    <li
                      key={event.id}
                      className="flex justify-between gap-3 py-3 text-xs"
                    >
                      <span className="font-medium">{event.label}</span>
                      <time
                        dateTime={event.occurredAt}
                        className="text-[var(--text-tertiary)]"
                      >
                        {new Date(event.occurredAt).toLocaleDateString("en-AU")}
                      </time>
                    </li>
                  ))}
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
        <Button
          onClick={() => setDraft(emptyApplication(activeWorkspace.profile.id))}
        >
          {t("applications.create")}
        </Button>
      </div>
      <div className="surface-card mb-7 flex flex-col gap-3 p-4 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">
            {zh ? "搜索申请" : "Search applications"}
          </span>
          <Input
            type="search"
            placeholder={zh ? "搜索机构或岗位" : "Search organisation or role"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Select
          aria-label={zh ? "筛选申请状态" : "Filter application status"}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:max-w-48"
        >
          <option value="All">{displayUiValue("All", language)}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {displayUiValue(status, language)}
            </option>
          ))}
        </Select>
        <div
          className="hidden rounded-xl bg-[var(--surface-subtle)] p-1 md:flex"
          aria-label="Application view"
        >
          {(["Board", "List"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`min-h-10 flex-1 rounded-lg px-4 text-sm font-medium ${view === mode ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--text-secondary)]"}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <section
        aria-label="Application analytics"
        className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {[
          ["Submitted", analytics.submitted],
          ["Awaiting response", analytics.awaitingResponse],
          ["Interviews", analytics.interviews],
          ["Offers", analytics.offers],
          ["Rejections", analytics.rejections],
        ].map(([label, value]) => (
          <div key={label} className="surface-card p-4">
            <strong className="font-display text-2xl">{value}</strong>
            <span className="mt-1 block text-xs text-[var(--text-secondary)]">
              {displayUiValue(String(label), language)}
            </span>
          </div>
        ))}
        <p className="text-xs text-[var(--text-tertiary)] sm:col-span-2 lg:col-span-5">
          {zh
            ? "统计仅使用用户创建的记录；至少有三段有效回复时间后才显示平均回复时长。"
            : "Counts use user-created records only. Average response time remains hidden until at least three valid response intervals exist."}
        </p>
      </section>

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
                    <StatusBadge status="active">
                      {application.status}
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
