import type { JobApplication } from "@/types/domain";

const portalNote = "官网显示“笔试环节（进行中）”，暂未收到笔试邮件、链接或站内入口，等待笔试通知。 The official recruitment portal shows “Assessment in Progress”, but no assessment email, link, or portal entry has been received yet.";

function confirmedPortalApplication(input: {
  id: string;
  jobId: string;
  organisationName: string;
  jobTitle: string;
  status: "Applied" | "Resume Screening";
  appliedAt: string;
  timestamp: string;
  location: string;
  notes: string;
}): JobApplication {
  return {
    id: input.id,
    profileId: "yuhan-yuan",
    jobId: input.jobId,
    organisationName: input.organisationName,
    jobTitle: input.jobTitle,
    status: input.status,
    source: "Company Website",
    savedAt: input.timestamp,
    appliedAt: input.appliedAt,
    nextAction: input.status === "Resume Screening"
      ? "Monitor the official portal and email for the next-stage invitation."
      : "Monitor the official portal for screening to begin.",
    nextActionDate: "",
    cvVersion: "Chinese résumé (version not confirmed)",
    notes: input.notes,
    lastUpdatedAt: input.timestamp,
    activity: [
      { id: `${input.id}-created`, type: "created", label: "Application created from confirmed submission", occurredAt: input.timestamp },
    ],
    statusHistory: [
      { id: `${input.id}-status`, status: input.status, timestamp: input.timestamp, notes: input.notes },
    ],
    sourceSnapshot: {
      location: input.location,
      officialUrl: input.organisationName === "百度"
        ? "https://talent.baidu.com/jobs/list?recruitType=INTERN"
        : "https://zhaopin.meituan.com/web/campus",
      deadline: null,
      recruitingBatch: input.organisationName === "美团" ? "2026年（2027届）秋季校招" : "实习招聘",
      title: input.jobTitle,
      company: input.organisationName,
      capturedAt: input.timestamp,
    },
    materials: [
      { id: `${input.id}-resume`, label: "Résumé", status: "Submitted", notes: "The portal confirms résumé submission; the exact file version is not shown in the evidence." },
    ],
    sessions: [],
  };
}

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
  confirmedPortalApplication({
    id: "yuhan-meituan-fintech-ai-fullstack-intern-2026-10-14",
    jobId: "meituan-fintech-ai-fullstack-intern-2027",
    organisationName: "美团",
    jobTitle: "财务科技-AI全栈实习生",
    status: "Resume Screening",
    appliedAt: "2026-10-14",
    timestamp: "2026-10-14T00:24:27.000Z",
    location: "北京 / 上海等",
    notes: "美团官方投递记录显示已于 2026-10-14 08:24:27 投递，当前状态为“简历筛选中”。",
  }),
  confirmedPortalApplication({
    id: "yuhan-meituan-ai-fullstack-engineer-2026-10-14",
    jobId: "meituan-2027-ai-fullstack-engineer",
    organisationName: "美团",
    jobTitle: "AI全栈工程师",
    status: "Applied",
    appliedAt: "2026-10-14",
    timestamp: "2026-10-14T00:25:22.000Z",
    location: "上海 / 成都",
    notes: "2026年（2027届）秋季校招志愿一；美团官方记录显示“网申成功”。意向部门：软硬件服务-软件研发部。",
  }),
  confirmedPortalApplication({
    id: "yuhan-meituan-ai-product-manager-2026-10-14",
    jobId: "meituan-2027-ai-product-manager",
    organisationName: "美团",
    jobTitle: "AI产品经理岗",
    status: "Applied",
    appliedAt: "2026-10-14",
    timestamp: "2026-10-14T00:26:25.000Z",
    location: "北京",
    notes: "2026年（2027届）秋季校招志愿二已提交；官方记录当前显示“待开启”，尚未进入简历筛选。意向部门：核心本地商业-平台及职能部门。",
  }),
  confirmedPortalApplication({
    id: "yuhan-meituan-ai-backend-engineer-2026-10-14",
    jobId: "meituan-2027-ai-backend-engineer",
    organisationName: "美团",
    jobTitle: "AI后端开发工程师",
    status: "Applied",
    appliedAt: "2026-10-14",
    timestamp: "2026-10-14T00:28:05.000Z",
    location: "上海",
    notes: "2026年（2027届）秋季校招志愿三已提交；官方记录当前显示“待开启”，尚未进入简历筛选。意向部门：核心本地商业-基础研发平台。",
  }),
  confirmedPortalApplication({
    id: "yuhan-baidu-ai-product-manager-intern-j106390-2026-10-14",
    jobId: "baidu-j106390",
    organisationName: "百度",
    jobTitle: "AI产品经理实习生（J106390）",
    status: "Resume Screening",
    appliedAt: "2026-10-14",
    timestamp: "2026-10-14T00:00:00.000Z",
    location: "北京",
    notes: "百度官方招聘门户显示投递日期为 2026-10-14，已完成简历投递，当前状态为“简历初筛中”；截图未显示具体投递时间。",
  }),
  confirmedPortalApplication({
    id: "yuhan-baidu-web-intern-j67060-2026-10-14",
    jobId: "baidu-j67060",
    organisationName: "百度",
    jobTitle: "web实习生（J67060）",
    status: "Resume Screening",
    appliedAt: "2026-10-14",
    timestamp: "2026-10-14T00:00:00.000Z",
    location: "北京 / 上海",
    notes: "百度官方招聘门户显示投递日期为 2026-10-14，已完成简历投递，当前状态为“简历初筛中”；截图未显示具体投递时间。",
  }),
  confirmedPortalApplication({
    id: "yuhan-baidu-frontend-intern-j95084-2026-10-14",
    jobId: "baidu-j95084",
    organisationName: "百度",
    jobTitle: "前端开发实习生（J95084）",
    status: "Resume Screening",
    appliedAt: "2026-10-14",
    timestamp: "2026-10-14T00:00:00.000Z",
    location: "北京 / 上海",
    notes: "百度官方招聘门户显示投递日期为 2026-10-14，已完成简历投递，当前状态为“简历初筛中”；截图未显示具体投递时间。",
  }),
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
