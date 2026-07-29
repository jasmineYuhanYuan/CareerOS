import { certifications } from "@/data/intelligence/certifications/core";
import { australiaRegulatedHealthcareProfessions } from "@/data/intelligence/healthcare/australia";
import { xeroGraduateInterview, xeroHackerRankAssessment } from "@/data/intelligence/interviews/xero";
import { intelligenceSearchIndex } from "@/data/intelligence/search";
import {
  australianChiropracticRegistration,
  canberraChiropracticEmployers,
} from "@/data/verified/chiropractic";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import type {
  KnowledgeEntity,
  KnowledgeEntityType,
  KnowledgeGraph,
  KnowledgeRelationship,
  KnowledgeSource,
} from "./types";
import { aliasesFor, resolveEntity } from "./resolution";

function entityType(domain: (typeof intelligenceSearchIndex)[number]["domain"]): KnowledgeEntityType {
  const map = {
    Company: "company",
    Job: "job",
    University: "programme",
    Certification: "certification",
    "Career pathway": "career-roadmap",
    Healthcare: "healthcare-profession",
    Interview: "interview-guide",
    Salary: "occupation",
    Visa: "visa",
    Registration: "registration-pathway",
  } as const;
  return map[domain];
}

export const knowledgeSources: KnowledgeSource[] = intelligenceSearchIndex.map((record) => ({
  id: `source:${record.id}`,
  label: record.source,
  url: record.officialUrl,
  sourceType: record.sourceType as KnowledgeSource["sourceType"],
  lastVerified: record.lastVerified,
}));

const baseEntities: KnowledgeEntity[] = intelligenceSearchIndex.map((record) => ({
  id: record.id,
  type: record.id === xeroHackerRankAssessment.id ? "oa-process" : entityType(record.domain),
  name: record.title,
  description: record.summary,
  aliases: aliasesFor(record.title),
  sourceIds: [`source:${record.id}`],
  verificationStatus: record.verificationStatus as KnowledgeEntity["verificationStatus"],
  confidence: record.confidence as KnowledgeEntity["confidence"],
  lastVerified: record.lastVerified,
  profileIds: record.id === australianChiropracticRegistration.id
    || record.id === "healthcare-au-chiropractic"
    || canberraChiropracticEmployers.some((employer) => employer.id === record.id)
    ? ["taicheng-guo-tommy"]
    : [],
}));

const supplementalEntities: KnowledgeEntity[] = [
  {
    id: "authority-ahpra",
    type: "registration-pathway",
    name: "Ahpra",
    description: "Australian Health Practitioner Regulation Agency, which administers registration for the National Boards.",
    aliases: aliasesFor("Ahpra"),
    sourceIds: ["source:healthcare-au-chiropractic"],
    verificationStatus: "Verified",
    confidence: "High",
    lastVerified: "2026-07-29",
    profileIds: ["taicheng-guo-tommy"],
  },
  {
    id: "location-canberra-act",
    type: "location",
    name: "Canberra / ACT",
    description: "Canberra and the Australian Capital Territory.",
    aliases: aliasesFor("Canberra / ACT"),
    sourceIds: canberraChiropracticEmployers.map((record) => `source:${record.id}`),
    verificationStatus: "Verified",
    confidence: "High",
    lastVerified: "2026-07-29",
    profileIds: ["taicheng-guo-tommy"],
  },
  {
    id: "occupation-chiropractor",
    type: "occupation",
    name: "Chiropractor",
    description: "A regulated Australian health profession.",
    aliases: ["Chiropractic practitioner"],
    sourceIds: [
      "source:healthcare-au-chiropractic",
      `source:${australianChiropracticRegistration.id}`,
    ],
    verificationStatus: "Verified",
    confidence: "High",
    lastVerified: "2026-07-29",
    profileIds: ["taicheng-guo-tommy"],
  },
  ...Array.from(new Set(verifiedCareerOpportunities.map((record) => record.company)))
    .filter((company) => !resolveEntity(company, baseEntities))
    .map((company): KnowledgeEntity => {
      const records = verifiedCareerOpportunities.filter((record) => record.company === company);
      return {
        id: `employer-${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        type: "company",
        name: company,
        description: "Employer represented by verified official early-career programme records.",
        aliases: aliasesFor(company),
        sourceIds: records.map((record) => `source:${record.id}`),
        verificationStatus: "Verified",
        confidence: "High",
        lastVerified: records[0].lastVerified,
        profileIds: [],
      };
    }),
];

export const knowledgeEntities: KnowledgeEntity[] = [
  ...baseEntities,
  ...supplementalEntities,
];

function relationship(
  id: string,
  sourceEntityId: string,
  targetEntityId: string,
  relationshipType: KnowledgeRelationship["relationshipType"],
  strength: number,
  rationale: string,
  evidenceSourceIds: string[],
  notes = "",
): KnowledgeRelationship {
  return {
    id,
    sourceEntityId,
    targetEntityId,
    relationshipType,
    strength,
    rationale,
    evidenceSourceIds,
    verificationStatus: "Verified",
    confidence: "High",
    lastVerified: "2026-07-29",
    notes,
  };
}

const earlyCareerRelationships = verifiedCareerOpportunities.flatMap((record) => {
  const company = resolveEntity(record.company, knowledgeEntities);
  if (!company) return [];
  return [
    relationship(
      `relationship-${company.id}-${record.id}`,
      company.id,
      record.id,
      "hires-for",
      100,
      `${record.company}'s official source publishes this ${record.earlyCareerType.toLowerCase()} programme record.`,
      [`source:${record.id}`],
      record.applicationStage === "Closed" ? "The programme record is verified, but its application stage is closed." : "",
    ),
  ];
});

const healthcareRelationships = australiaRegulatedHealthcareProfessions.map((record) =>
  relationship(
    `relationship-${record.id}-ahpra`,
    record.id,
    "authority-ahpra",
    "regulated-by",
    100,
    `${record.profession} is listed in the official Ahpra and National Boards registration standards directory.`,
    [`source:${record.id}`],
  ),
);

const clinicRelationships = canberraChiropracticEmployers.map((record) =>
  relationship(
    `relationship-${record.id}-canberra`,
    record.id,
    "location-canberra-act",
    "located-in",
    record.suburb === "Queanbeyan" ? 75 : 100,
    `${record.organisationName}'s official website identifies its location as ${record.suburb}.`,
    [`source:${record.id}`],
    "Directory relationship only; it does not claim a current vacancy.",
  ),
);

const certificationRelationships = certifications.flatMap((record) =>
  record.recommendedCareers
    .map((career) => resolveEntity(career, knowledgeEntities))
    .filter((entity): entity is KnowledgeEntity => Boolean(entity))
    .map((entity) =>
      relationship(
        `relationship-${record.id}-${entity.id}`,
        record.id,
        entity.id,
        "supports-career",
        45,
        `${record.provider} positions this credential as foundational or role-relevant; it is not treated as a job requirement.`,
        [`source:${record.id}`],
        "Low-strength planning connection, not an employer requirement.",
      ),
    ),
);

export const knowledgeRelationships: KnowledgeRelationship[] = [
  ...earlyCareerRelationships,
  ...healthcareRelationships,
  ...clinicRelationships,
  ...certificationRelationships,
  relationship(
    "relationship-xero-interview",
    "company-xero-au",
    xeroGraduateInterview.id,
    "interview-process",
    100,
    "Xero's official early-careers page describes the graduate and intern interview stages.",
    [`source:${xeroGraduateInterview.id}`],
  ),
  relationship(
    "relationship-xero-hackerrank",
    xeroGraduateInterview.id,
    xeroHackerRankAssessment.id,
    "uses-assessment",
    100,
    "Xero's official early-careers page states that technical applicants complete a HackerRank assessment.",
    [`source:${xeroHackerRankAssessment.id}`],
  ),
  relationship(
    "relationship-chiropractor-registration",
    "occupation-chiropractor",
    australianChiropracticRegistration.id,
    "requires-registration",
    100,
    "The Chiropractic Board of Australia requires registration before practising as a chiropractor in Australia.",
    [`source:${australianChiropracticRegistration.id}`],
  ),
  relationship(
    "relationship-chiropractor-ahpra",
    australianChiropracticRegistration.id,
    "authority-ahpra",
    "regulated-by",
    100,
    "Ahpra administers registration for the Chiropractic Board of Australia.",
    [`source:${australianChiropracticRegistration.id}`],
  ),
];

export const careerKnowledgeGraph: KnowledgeGraph = {
  entities: knowledgeEntities,
  relationships: knowledgeRelationships,
  sources: knowledgeSources,
};

export function connectionsFor(entityId: string): KnowledgeRelationship[] {
  return knowledgeRelationships.filter(
    (relationship) =>
      relationship.sourceEntityId === entityId
      || relationship.targetEntityId === entityId,
  );
}

export function entityById(id: string): KnowledgeEntity | undefined {
  return knowledgeEntities.find((entity) => entity.id === id);
}
