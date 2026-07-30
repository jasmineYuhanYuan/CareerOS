import type { DataConfidence } from "@/data/verified/types";

export type RequirementImportance =
  | "required"
  | "strongly-preferred"
  | "helpful"
  | "informational";
export type GapStatus = "confirmed" | "missing" | "unknown" | "blocked";
export type ActionWindow = "Immediate" | "Next 30 days" | "Next 3 months" | "Longer term";

export interface CareerRequirement {
  id: string;
  label: string;
  importance: RequirementImportance;
  status: GapStatus;
  explanation: string;
  evidenceSourceIds: string[];
}

export interface GapAction {
  id: string;
  title: string;
  reason: string;
  relatedGapId: string;
  priority: "High" | "Medium" | "Low";
  estimatedEffort: string;
  evidenceSourceIds: string[];
  status: "Not started" | "In progress" | "Completed";
  window: ActionWindow;
  dueDate: string;
  notes: string;
}

export interface GapAnalysisResult {
  profileId: string;
  targetId: string;
  targetName: string;
  overallReadinessScore: number;
  confidence: DataConfidence;
  matchedRequirements: CareerRequirement[];
  missingRequirements: CareerRequirement[];
  unknownRequirements: CareerRequirement[];
  blockers: CareerRequirement[];
  recommendedNextActions: GapAction[];
  evidenceSourceIds: string[];
  scoreExplanation: string[];
  evidenceCount: number;
  unknownCount: number;
  scoreCap: number;
  scoreCapReason: string;
}
