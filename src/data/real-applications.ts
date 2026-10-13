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
  {
    id: "yuhan-prifi-intern-2026-10-10",
    profileId: "yuhan-yuan",
    jobId: "manual-prifi-intern-2026-10-10",
    organisationName: "PriFi",
    jobTitle: "PriFi Intern",
    status: "Applied",
    source: "Other",
    savedAt: "2026-10-10T02:07:00.000Z",
    appliedAt: "2026-10-10",
    nextAction: "Follow up if no response is received.",
    nextActionDate: "2026-10-17",
    cvVersion: "English software engineering résumé",
    notes: "Application sent by email with a tailored message. English résumé and English portfolio were submitted.",
    lastUpdatedAt: "2026-10-10T02:07:00.000Z",
    activity: [
      { id: "prifi-created", type: "created", label: "Application created from confirmed submission", occurredAt: "2026-10-10T02:07:00.000Z" },
    ],
    statusHistory: [
      { id: "prifi-status-applied", status: "Applied", timestamp: "2026-10-10T02:07:00.000Z", notes: "Application email sent successfully." },
    ],
    sourceSnapshot: {
      location: "Sydney, Australia",
      officialUrl: "https://www.prifi.com/intern",
      deadline: null,
      recruitingBatch: "",
      title: "PriFi Intern",
      company: "PriFi",
      capturedAt: "2026-10-10T02:07:00.000Z",
    },
    materials: [
      { id: "prifi-resume", label: "English résumé", status: "Submitted", notes: "Jasmine_Yuan_Software_Engineering_Resume.pdf" },
      { id: "prifi-portfolio", label: "English portfolio", status: "Submitted", notes: "Portfolio_EN.pptx.pdf" },
    ],
    sessions: [],
  },
  {
    id: "yuhan-primepilot-ai-developer-intern-2026-10-10",
    profileId: "yuhan-yuan",
    jobId: "manual-primepilot-ai-developer-intern-2026-10-10",
    organisationName: "PrimePilot AI",
    jobTitle: "AI Developer Intern",
    status: "Applied",
    source: "Other",
    savedAt: "2026-10-10T02:09:00.000Z",
    appliedAt: "2026-10-10",
    nextAction: "Follow up if no response is received.",
    nextActionDate: "2026-10-17",
    cvVersion: "English software engineering résumé",
    notes: "Application sent by email with a tailored message. English résumé and English portfolio were submitted.",
    lastUpdatedAt: "2026-10-10T02:09:00.000Z",
    activity: [
      { id: "primepilot-created", type: "created", label: "Application created from confirmed submission", occurredAt: "2026-10-10T02:09:00.000Z" },
    ],
    statusHistory: [
      { id: "primepilot-status-applied", status: "Applied", timestamp: "2026-10-10T02:09:00.000Z", notes: "Application email sent successfully." },
    ],
    materials: [
      { id: "primepilot-resume", label: "English résumé", status: "Submitted", notes: "Jasmine_Yuan_Software_Engineering_Resume.pdf" },
      { id: "primepilot-portfolio", label: "English portfolio", status: "Submitted", notes: "Portfolio_EN.pptx.pdf" },
    ],
    sessions: [],
  },
  {
    id: "yuhan-solotude-software-engineer-intern-2026-10-10",
    profileId: "yuhan-yuan",
    jobId: "manual-solotude-software-engineer-intern-2026-10-10",
    organisationName: "Solotude",
    jobTitle: "Software Engineer Intern",
    status: "Applied",
    source: "Other",
    savedAt: "2026-10-10T02:11:00.000Z",
    appliedAt: "2026-10-10",
    nextAction: "Follow up if no response is received.",
    nextActionDate: "2026-10-17",
    cvVersion: "English software engineering résumé",
    notes: "Application sent by email with a tailored response to the project screening question. The role was disclosed as unpaid.",
    lastUpdatedAt: "2026-10-10T02:11:00.000Z",
    activity: [
      { id: "solotude-created", type: "created", label: "Application created from confirmed submission", occurredAt: "2026-10-10T02:11:00.000Z" },
    ],
    statusHistory: [
      { id: "solotude-status-applied", status: "Applied", timestamp: "2026-10-10T02:11:00.000Z", notes: "Application email sent successfully." },
    ],
    materials: [
      { id: "solotude-resume", label: "English résumé", status: "Submitted", notes: "Jasmine_Yuan_Software_Engineering_Resume.pdf" },
      { id: "solotude-portfolio", label: "Portfolio", status: "Not applicable", notes: "Not included in the confirmed submission." },
    ],
    sessions: [],
  },
  {
    id: "yuhan-swipejobs-gtm-engineer-internship-2026-10-12",
    profileId: "yuhan-yuan",
    jobId: "swipejobs-gtm-engineer-internship-ac1dcdc28b80",
    organisationName: "swipejobs",
    jobTitle: "GTM Engineer Internship",
    status: "Applied",
    source: "Company Website",
    savedAt: "2026-10-12T07:42:00.000Z",
    appliedAt: "2026-10-12",
    nextAction: "Follow up if no response is received.",
    nextActionDate: "2026-10-19",
    cvVersion: "English software engineering résumé",
    notes: "Application submitted through the employer application form with a tailored cover letter.",
    lastUpdatedAt: "2026-10-12T07:42:00.000Z",
    activity: [
      { id: "swipejobs-created", type: "created", label: "Application created from confirmed submission", occurredAt: "2026-10-12T07:42:00.000Z" },
    ],
    statusHistory: [
      { id: "swipejobs-status-applied", status: "Applied", timestamp: "2026-10-12T07:42:00.000Z", notes: "Application form submitted successfully." },
    ],
    sourceSnapshot: {
      location: "Australia",
      officialUrl: "https://swipejobs.breezy.hr/p/ac1dcdc28b80-gtm-engineer-internship/apply",
      deadline: null,
      recruitingBatch: "",
      title: "GTM Engineer Internship",
      company: "swipejobs",
      capturedAt: "2026-10-12T07:42:00.000Z",
    },
    materials: [
      { id: "swipejobs-resume", label: "English résumé", status: "Submitted", notes: "Jasmine_Yuan_Software_Engineering_Resume.pdf" },
      { id: "swipejobs-cover-letter", label: "Tailored cover letter", status: "Submitted", notes: "Submitted in the employer application form." },
    ],
    sessions: [],
  },
];

export function mergeKnownYuhanApplications(applications: JobApplication[]): JobApplication[] {
  return yuhanKnownApplications.reduce<JobApplication[]>((records, known) => {
    const matchIndex = records.findIndex((application) =>
      application.id === known.id ||
      (application.organisationName === known.organisationName && application.jobTitle === known.jobTitle),
    );
    if (matchIndex < 0) return [...records, structuredClone(known)];
    return records.map((application, index) => index === matchIndex
      ? { ...structuredClone(known), ...application, id: application.id || known.id, appliedAt: application.appliedAt || known.appliedAt, savedAt: application.savedAt || known.savedAt, cvVersion: application.cvVersion || known.cvVersion, materials: application.materials ?? known.materials, sessions: application.sessions ?? known.sessions }
      : application);
  }, applications);
}
