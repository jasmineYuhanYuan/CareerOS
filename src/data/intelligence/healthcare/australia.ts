import { verifiedSource } from "@/data/intelligence/source";
import type { HealthcareProfessionRecord } from "@/data/intelligence/types";

const professions: Array<[string, string, string]> = [
  ["medicine", "Medicine", "Medical Board of Australia"],
  ["dentistry", "Dentistry", "Dental Board of Australia"],
  ["nursing", "Nursing", "Nursing and Midwifery Board of Australia"],
  ["midwifery", "Midwifery", "Nursing and Midwifery Board of Australia"],
  ["psychology", "Psychology", "Psychology Board of Australia"],
  ["physiotherapy", "Physiotherapy", "Physiotherapy Board of Australia"],
  ["chiropractic", "Chiropractic", "Chiropractic Board of Australia"],
  ["pharmacy", "Pharmacy", "Pharmacy Board of Australia"],
  ["occupational-therapy", "Occupational Therapy", "Occupational Therapy Board of Australia"],
  ["optometry", "Optometry", "Optometry Board of Australia"],
  ["medical-radiation-practice", "Medical Radiation Practice", "Medical Radiation Practice Board of Australia"],
  ["paramedicine", "Paramedicine", "Paramedicine Board of Australia"],
];

export const australiaRegulatedHealthcareProfessions: HealthcareProfessionRecord[] = professions.map(([id, profession, authority]) => ({
  ...verifiedSource({
    source: "Ahpra and National Boards registration standards directory",
    officialUrl: "https://www.ahpra.gov.au/Registration/Registration-Standards.aspx",
    sourceType: "Government",
    country: "Australia",
    region: "Australia",
  }),
  id: `healthcare-au-${id}`,
  domain: "Healthcare",
  profession,
  statutoryRegistration: true,
  authority,
  administrationBody: "Australian Health Practitioner Regulation Agency (Ahpra)",
  renewal: "Annual renewal is required; profession-specific dates and standards must be checked with the relevant National Board",
  insurance: "The relevant National Board professional indemnity insurance registration standard applies",
  cpd: "The relevant National Board continuing professional development registration standard applies",
  careerProgression: [],
  salary: null,
  demand: null,
  uncertaintyNotes: [
    "Career progression is not prescribed by the central registration source.",
    "Salary and labour demand require separate government labour-market evidence.",
    "Applicants must check profession-specific qualification, English, criminal history, recency and other standards.",
  ],
}));
