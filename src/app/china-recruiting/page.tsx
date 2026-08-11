import type { Metadata } from "next";
import { ChinaRecruitingWorkspace } from "@/components/china-recruiting/china-recruiting-workspace";

export const metadata: Metadata = { title: "China Campus Recruiting" };

export default function ChinaRecruitingPage() {
  return <ChinaRecruitingWorkspace />;
}
