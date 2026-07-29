import type {
  DataConfidence,
  DataVerificationStatus,
  VerifiedSourceType,
} from "@/data/verified/types";

export type KnowledgeEntityType =
  | "company"
  | "job"
  | "occupation"
  | "skill"
  | "certification"
  | "university"
  | "programme"
  | "visa"
  | "registration-pathway"
  | "interview-guide"
  | "oa-process"
  | "career-roadmap"
  | "healthcare-profession"
  | "location"
  | "industry";

export type KnowledgeRelationshipType =
  | "hires-for"
  | "requires-skill"
  | "prefers-skill"
  | "relevant-certification"
  | "offers-programme"
  | "located-in"
  | "regulated-by"
  | "requires-registration"
  | "relevant-visa"
  | "interview-process"
  | "uses-assessment"
  | "supports-career"
  | "progresses-to"
  | "related-career"
  | "prepares-for"
  | "suitable-for"
  | "employer-of"
  | "qualification-for";

export interface KnowledgeSource {
  id: string;
  label: string;
  url: string;
  sourceType: VerifiedSourceType;
  lastVerified: string;
}

export interface KnowledgeEntity {
  id: string;
  type: KnowledgeEntityType;
  name: string;
  description: string;
  aliases: string[];
  sourceIds: string[];
  verificationStatus: DataVerificationStatus;
  confidence: DataConfidence;
  lastVerified: string;
  profileIds: string[];
}

export interface KnowledgeRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: KnowledgeRelationshipType;
  strength: number;
  rationale: string;
  evidenceSourceIds: string[];
  verificationStatus: DataVerificationStatus;
  confidence: DataConfidence;
  lastVerified: string;
  notes: string;
}

export interface KnowledgeGraph {
  entities: KnowledgeEntity[];
  relationships: KnowledgeRelationship[];
  sources: KnowledgeSource[];
}
