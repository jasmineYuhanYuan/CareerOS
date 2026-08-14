import type { JobApplication } from "@/types/domain";

const portalNote = "官网显示“笔试环节（进行中）”，暂未收到笔试邮件、链接或站内入口，等待笔试通知。 The official recruitment portal shows “Assessment in Progress”, but no assessment email, link, or portal entry has been received yet.";

export const yuhanKnownApplications: JobApplication[] = [
  {
    id: "yuhan-xiaohongshu-product-engineer-19383",
    profileId: "yuhan-yuan",
    jobId: "xiaohongshu-product-engineer-19383",
    organisationName: "小红书",
    jobTitle: "Product Engineer - 产品工程师（AI 全栈 / 应用研发方向）",
    status: "Assessment In Progress",
    source: "Company Website",
    savedAt: "2026-08-14T00:00:00.000Z",
    appliedAt: "",
    nextAction: "Check email and recruitment portal for assessment invitation.",
    nextActionDate: "",
    cvVersion: "",
    notes: portalNote,
    lastUpdatedAt: "2026-08-14T03:00:00.000Z",
    activity: [
      { id: "xhs-created", type: "created", label: "Application created", occurredAt: "2026-08-14T00:00:00.000Z" },
      { id: "xhs-screening", type: "status_changed", label: "Applied → Resume Screening", occurredAt: "2026-08-14T01:00:00.000Z" },
      { id: "xhs-assessment-progress", type: "status_changed", label: "Resume Screening → Assessment In Progress", occurredAt: "2026-08-14T03:00:00.000Z" },
    ],
    statusHistory: [
      { id: "xhs-status-applied", status: "Applied", timestamp: "2026-08-14T00:00:00.000Z", notes: "Application submitted through the official recruitment portal." },
      { id: "xhs-status-screening", status: "Resume Screening", timestamp: "2026-08-14T01:00:00.000Z", notes: "Official recruitment portal progressed to résumé screening." },
      { id: "xhs-status-assessment-progress", status: "Assessment In Progress", timestamp: "2026-08-14T03:00:00.000Z", notes: portalNote },
    ],
    sourceSnapshot: {
      location: "Beijing / Shanghai / Hangzhou",
      officialUrl: "https://job.xiaohongshu.com/campus/position/19383",
      deadline: null,
      recruitingBatch: "2027 internship",
      title: "Product Engineer - 产品工程师（AI 全栈 / 应用研发方向）",
      company: "小红书",
      capturedAt: "2026-08-14T03:00:00.000Z",
    },
    materials: [],
    sessions: [],
  },
];

export function mergeKnownYuhanApplications(applications: JobApplication[]): JobApplication[] {
  const known = yuhanKnownApplications[0];
  const matchIndex = applications.findIndex((application) =>
    application.id === known.id ||
    (application.organisationName === known.organisationName && application.jobTitle === known.jobTitle),
  );
  if (matchIndex < 0) return [...applications, structuredClone(known)];
  return applications.map((application, index) => index === matchIndex
    ? { ...application, ...structuredClone(known), id: application.id || known.id, appliedAt: application.appliedAt || known.appliedAt, savedAt: application.savedAt || known.savedAt, cvVersion: application.cvVersion, materials: application.materials ?? known.materials, sessions: application.sessions ?? known.sessions }
    : application);
}
