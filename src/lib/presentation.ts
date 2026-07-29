export function displayOrganisationName(name: string): string {
  return name.replace(/\s*\(Sample\)\s*$/i, "");
}

export function sampleStatus(language: "en" | "zh-CN"): string {
  return language === "zh-CN" ? "示例数据 · 非实时职位" : "Sample data · Not a live vacancy";
}
