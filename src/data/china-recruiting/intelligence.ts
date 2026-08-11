import type { ChinaAssessmentIntelligence, ChinaInterviewIntelligence } from "@/types/domain";

export const chinaAssessmentIntelligence: ChinaAssessmentIntelligence[] = [
  {
    id: "dji-2026-campus-assessment",
    company: "DJI / 大疆",
    roleFamily: "All",
    region: "China",
    assessmentProvider: null,
    assessmentTypes: ["General aptitude", "Written test"],
    reportedStage: "Official 2026 autumn process: HR screening, online assessment and department screening; some roles included a written test.",
    sourceType: "Official",
    confidence: "High",
    sourceUrl: "https://we.dji.com/zh-CN/campus/recruitment",
    sourceDate: "2025-07-01",
    lastVerifiedAt: "2026-08-11",
    notes: "Historical process evidence only. It must not be presented as current 2027 policy; provider and exact format were not published.",
  },
];

export const chinaInterviewIntelligence: ChinaInterviewIntelligence[] = [
  {
    id: "tencent-campus-official-process",
    company: "Tencent / 腾讯",
    roleFamily: "All",
    likelyStages: ["投递岗位", "面试邀约", "专业初试", "复试（轮次因岗位而异）", "HR资格面试", "Offer", "背景调查"],
    focusAreas: [],
    typicalRounds: null,
    sourceType: "Official",
    sourceDate: "2026-08-11",
    confidence: "High",
    sourceUrl: "https://careers.tencent.com/campusrecruit.html",
    lastVerifiedAt: "2026-08-11",
    notes: "Only the stages published by Tencent are recorded. Technical topics, round count and assessment provider remain unknown.",
  },
  {
    id: "dji-2026-campus-interview",
    company: "DJI / 大疆",
    roleFamily: "All",
    likelyStages: ["简历投递", "初筛及复筛", "线上面试（部分终面线下）", "结果反馈"],
    focusAreas: [],
    typicalRounds: null,
    sourceType: "Official",
    sourceDate: "2025-07-01",
    confidence: "High",
    sourceUrl: "https://we.dji.com/zh-CN/campus/recruitment",
    lastVerifiedAt: "2026-08-11",
    notes: "Archived 2026-cycle process evidence; not asserted as the current 2027 process.",
  },
];
