import { verifiedSource } from "@/data/intelligence/source";
import type { CompanyIntelligenceRecord } from "@/data/intelligence/types";

export const chinaTechnologyCompanies: CompanyIntelligenceRecord[] = [
  {
    ...verifiedSource({ source: "字节跳动校园招聘官网", officialUrl: "https://jobs.bytedance.com/campus/", sourceType: "Employer", country: "China", region: "China and global", language: "zh-CN", nextReviewDate: "2026-08-05" }),
    id: "company-bytedance-cn", domain: "Company", name: "ByteDance / 字节跳动", industry: "Internet technology",
    careerPage: "https://jobs.bytedance.com/campus/", graduateProgram: "校园招聘", internship: "实习岗位通过官方校园招聘门户发布",
    officeLocations: [], visaPolicy: null, technologyStack: [], interviewStages: [],
    recruitmentSeason: "官方 2026 校招页面曾列出 2025年8月至2026年5月31日投递；该周期现已结束",
    unknownFields: ["Current 2027 intake dates", "Office allocation by role", "Visa policy", "Interview stages"],
  },
  {
    ...verifiedSource({ source: "腾讯校园招聘", officialUrl: "https://careers.tencent.com/campusrecruit.html", sourceType: "Employer", country: "China", region: "China and overseas", language: "zh-CN", nextReviewDate: "2026-08-05" }),
    id: "company-tencent-cn", domain: "Company", name: "Tencent / 腾讯", industry: "Internet technology",
    careerPage: "https://careers.tencent.com/campusrecruit.html", graduateProgram: "校园招聘", internship: "面向在校学生、至少两个月的实习项目",
    officeLocations: [], visaPolicy: null, technologyStack: [],
    interviewStages: ["投递岗位", "面试邀约", "专业初试", "复试（轮次因岗位而异）", "HR资格面试", "Offer", "背景调查"],
    recruitmentSeason: null,
    unknownFields: ["Current closing dates", "Office allocation by role", "Visa policy"],
  },
  {
    ...verifiedSource({ source: "阿里巴巴校园招聘", officialUrl: "https://campus-talent.alibaba.com/", sourceType: "Employer", country: "China", region: "China and overseas", language: "zh-CN", nextReviewDate: "2026-08-05" }),
    id: "company-alibaba-cn", domain: "Company", name: "Alibaba / 阿里巴巴", industry: "Internet and cloud technology",
    careerPage: "https://campus-talent.alibaba.com/", graduateProgram: "面向海内外应届生的校园招聘", internship: null,
    officeLocations: [], visaPolicy: null, technologyStack: [], interviewStages: [],
    recruitmentSeason: "当前官方页面面向毕业时间为 2026年11月至2027年10月的应届生",
    unknownFields: ["Internship program details", "Current closing date", "Office allocation by role", "Visa policy", "Interview stages"],
  },
  {
    ...verifiedSource({ source: "百度校园招聘", officialUrl: "https://talent.baidu.com/jobs/campus", sourceType: "Employer", country: "China", region: "China and global", language: "zh-CN", nextReviewDate: "2026-08-05" }),
    id: "company-baidu-cn", domain: "Company", name: "Baidu / 百度", industry: "Internet and AI technology",
    careerPage: "https://talent.baidu.com/jobs/campus", graduateProgram: "面向全球 2027 届毕业生的校园招聘", internship: "面向在校生且不少于三个月的实习项目",
    officeLocations: ["Beijing", "Shanghai", "Shenzhen"], visaPolicy: null, technologyStack: [], interviewStages: [],
    recruitmentSeason: "官方页面面向 2026年9月至2027年8月毕业的在校生",
    unknownFields: ["Current closing date", "Visa policy", "Interview stages"],
  },
];
