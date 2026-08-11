export interface ChinaTrackingTarget {
  id: string;
  company: string;
  country: "China";
  trackingOnly: true;
  officialRecruitingUrl: string | null;
}

const targets: Array<[string, string, string | null]> = [
  ["dewu", "得物", null],
  ["boss-zhipin", "BOSS直聘", null],
  ["trip-com", "携程", null],
  ["tongcheng", "同程旅行", null],
  ["hello", "哈啰", null],
  ["kuaishou", "快手", null],
  ["didi", "滴滴", null],
  ["xiaohongshu", "小红书", "https://job.xiaohongshu.com/campus"],
  ["keep", "Keep", null],
  ["soul", "Soul", null],
  ["zuoyebang", "作业帮", null],
  ["yuanfudao", "猿辅导", null],
  ["baidu", "百度", "https://talent.baidu.com/jobs/campus"],
  ["meituan", "美团", "https://zhaopin.meituan.com/web/campus"],
  ["jd", "京东", "https://campus.jd.com/"],
  ["xiaomi", "小米", "https://hr.xiaomi.com/campus"],
  ["huawei", "华为", "https://career.huawei.com/reccampportal/portal5/campus-recruitment.html"],
  ["tencent", "腾讯", "https://careers.tencent.com/campusrecruit.html"],
  ["alibaba", "阿里巴巴", "https://campus-talent.alibaba.com/"],
  ["bytedance", "字节跳动", "https://jobs.bytedance.com/campus/"],
  ["pinduoduo", "拼多多", "https://careers.pinduoduo.com/campus/"],
  ["netease", "网易", null],
  ["mihoyo", "米哈游", null],
];

export const chinaTrackingTargets: ChinaTrackingTarget[] = targets.map(([id, company, officialRecruitingUrl]) => ({
  id: `china-target-${id}`,
  company,
  country: "China",
  trackingOnly: true,
  officialRecruitingUrl,
}));
