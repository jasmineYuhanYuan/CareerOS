import { verifiedSource } from "@/data/intelligence/source";
import type { VisaIntelligenceRecord } from "@/data/intelligence/types";

const homeAffairs = (subclass: string, name: string, slug: string, purpose: string): VisaIntelligenceRecord => ({
  ...verifiedSource({ source: `Australian Department of Home Affairs — ${name}`, officialUrl: `https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/${slug}`, sourceType: "Government", country: "Australia", region: "Australia", nextReviewDate: "2026-08-05" }),
  id: `visa-au-${subclass}`, domain: "Visa", subclass, name, purpose,
  eligibilitySummary: ["Eligibility is individual and must be checked on the current Home Affairs page"],
  employerSponsorshipRequired: null, invitationRequired: null, stay: null, cost: null,
  caution: "CareerOS provides a source index, not migration advice. Visa settings, eligibility and charges can change.",
});

export const australiaVisas: VisaIntelligenceRecord[] = [
  {
    ...homeAffairs("500", "Student visa", "student-500", "Study in an eligible course in Australia"),
    eligibilitySummary: ["Hold a valid Confirmation of Enrolment when the visa is decided", "Hold Overseas Student Health Cover unless exempt", "Other individual criteria apply"],
    employerSponsorshipRequired: false, invitationRequired: false, stay: "Up to 6 years and in line with enrolment, as stated by Home Affairs",
  },
  homeAffairs("485", "Temporary Graduate visa", "temporary-graduate-485", "Temporary post-study visa with streams and eligibility defined by Home Affairs"),
  {
    ...homeAffairs("482", "Skills in Demand visa", "skills-in-demand-visa-subclass-482", "Employer-sponsored temporary skilled work"),
    eligibilitySummary: ["Be nominated for a skilled position by an approved sponsor", "Have the right skills", "Meet relevant English requirements"],
    employerSponsorshipRequired: true, invitationRequired: false, stay: "Up to 4 years for the published Core Skills and Specialist Skills streams",
    cost: "From A$4,015 as displayed at verification",
  },
  {
    ...homeAffairs("186", "Employer Nomination Scheme visa", "employer-nomination-scheme-186", "Employer-nominated permanent skilled migration"),
    employerSponsorshipRequired: true, invitationRequired: false,
  },
  {
    ...homeAffairs("189", "Skilled Independent visa", "skilled-independent-189", "Points-tested independent skilled migration"),
    employerSponsorshipRequired: false, invitationRequired: true,
  },
  {
    ...homeAffairs("190", "Skilled Nominated visa", "skilled-nominated-190", "State or territory nominated permanent skilled migration"),
    employerSponsorshipRequired: false, invitationRequired: true,
  },
  {
    ...homeAffairs("491", "Skilled Work Regional (Provisional) visa", "skilled-work-regional-provisional-491", "Regional provisional skilled migration"),
    employerSponsorshipRequired: false, invitationRequired: true,
  },
];
