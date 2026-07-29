import type {
  ChiropracticVacancyRecord,
  InterviewQuestionRecord,
  ProfessionalRegistrationPathway,
  VerifiedEmployerDirectoryRecord,
} from "./types";

const reviewed = {
  verified: true,
  lastVerified: "2026-07-29",
  lastUpdated: "2026-07-29",
  nextReviewDate: "2026-08-29",
  country: "Australia",
  language: "en" as const,
  region: "ACT and nearby NSW",
  confidence: "High" as const,
  verificationStatus: "Verified" as const,
};

const boardStandards = "https://www.chiropracticboard.gov.au/Registration-Standards.aspx";
const graduateRegistration = "https://www.ahpra.gov.au/Registration/Graduate-registration.aspx";

export const australianChiropracticRegistration: ProfessionalRegistrationPathway = {
  ...reviewed,
  id: "australia-chiropractor-general-registration",
  profession: "Chiropractor",
  regulator: "Chiropractic Board of Australia",
  administrationBody: "Australian Health Practitioner Regulation Agency (Ahpra)",
  registrationRequired: true,
  source: "Chiropractic Board of Australia quick reference guide and Ahpra graduate registration guidance",
  officialUrl: "https://www.chiropracticboard.gov.au/Registration.aspx",
  sourceType: "Government",
  applicationPortalUrl: graduateRegistration,
  governmentSource: true,
  requirements: [
    {
      label: "Approved qualification",
      detail: "Graduates apply on the basis of completing a Board-approved program of study. The education provider supplies graduate results directly to Ahpra.",
      sourceUrl: graduateRegistration,
    },
    {
      label: "English language skills",
      detail: "Applicants must demonstrate that they meet the applicable English language skills registration standard. The correct evidence pathway must be confirmed from the current standard.",
      sourceUrl: boardStandards,
    },
    {
      label: "Criminal history",
      detail: "Applicants must meet the criminal history registration standard and disclose relevant history as required in the application.",
      sourceUrl: boardStandards,
    },
    {
      label: "Professional indemnity insurance",
      detail: "Registered chiropractors must meet the Board’s professional indemnity insurance arrangements standard before practising.",
      sourceUrl: boardStandards,
    },
    {
      label: "Recency of practice",
      detail: "Applicants and registrants must meet the Chiropractic Board’s recency-of-practice standard where it applies.",
      sourceUrl: boardStandards,
    },
    {
      label: "Continuing professional development",
      detail: "Practising registrants must comply with the current Chiropractic Board CPD registration standard.",
      sourceUrl: boardStandards,
    },
    {
      label: "Identity and supporting documents",
      detail: "Applicants complete Ahpra’s identity check and upload the documents requested by the online application.",
      sourceUrl: graduateRegistration,
    },
    {
      label: "Graduate application timing",
      detail: "Students completing an approved program can apply before formal graduation; Ahpra cannot finalise the application until it receives graduate results and all required checks and documents.",
      sourceUrl: "https://www.ahpra.gov.au/Registration/Graduate-registration/Graduate-FAQ.aspx",
    },
    {
      label: "Annual renewal",
      detail: "General and non-practising chiropractic registration is renewed annually. The Board’s quick guide identifies 30 November as the renewal date; confirm the current renewal notice before acting.",
      sourceUrl: "https://www.chiropracticboard.gov.au/Registration/Registration-Renewal.aspx",
    },
    {
      label: "Practitioner register",
      detail: "Registration status can be checked on Ahpra’s public register of practitioners.",
      sourceUrl: "https://www.ahpra.gov.au/Registration/Registers-of-Practitioners.aspx",
    },
  ],
  internationalQualificationPathway: "New Zealand registrants may use the Trans-Tasman Mutual Recognition pathway. Other overseas-qualified chiropractors are directed by the Board to the Council on Chiropractic Education Australasia assessment pathway before applying for general registration.",
  estimatedCost: null,
  processingTime: null,
  examinationRequirement: null,
  uncertaintyNotes: [
    "Tommy’s qualification-completion status is not recorded.",
    "Tommy’s registration status is not recorded.",
    "Tommy’s English-language evidence pathway is not recorded.",
    "Fees and individual processing time are deliberately omitted until checked against the live application context.",
    "No immigration or work-right status is assumed.",
  ],
};

function employer(
  id: string,
  organisationName: string,
  suburb: string,
  website: string,
  serviceFocus: string,
  multidisciplinaryStatus: string,
  contactInformation: string,
): VerifiedEmployerDirectoryRecord {
  return {
    ...reviewed,
    id,
    organisationName,
    organisationType: "Chiropractic clinic",
    suburb,
    city: suburb === "Queanbeyan" ? "Queanbeyan" : "Canberra",
    stateOrTerritory: suburb === "Queanbeyan" ? "NSW" : "ACT",
    website,
    careersPage: null,
    serviceFocus,
    multidisciplinaryStatus,
    graduateSupport: null,
    contactInformation,
    source: `${organisationName} official website`,
    officialUrl: website,
    sourceType: "Official",
    directoryStatus: "Official employer website",
    dataNotes: "Employer directory record only. The official website did not provide a verified current vacancy or graduate-mentoring claim at review time.",
  };
}

export const canberraChiropracticEmployers: VerifiedEmployerDirectoryRecord[] = [
  employer("canberra-city-chiropractic", "Canberra City Chiropractic", "Deakin", "https://www.canberracitychiro.com.au/", "Chiropractic, musculoskeletal and sports-injury care", "States that it works with other local health professionals", "(02) 6106 9977"),
  employer("act-chiropractic", "ACT Chiropractic", "Gungahlin", "https://actchiropractic.com.au/", "Chiropractic care", "Not stated", "(02) 6262 0880"),
  employer("canberra-chiropractic", "Canberra Chiropractic", "Turner", "https://www.canberrachiropractic.com.au/", "Chiropractic care", "Not stated", "(02) 6247 3388"),
  employer("weston-creek-chiropractic", "Weston Creek Chiropractic Centre", "Weston", "https://www.wcccentre.com.au/", "Evidence-based chiropractic, sports injuries and massage therapy", "Multiple service types stated", "(02) 6288 6711"),
  employer("capital-chiropractic-centre", "Capital Chiropractic Centre", "Braddon", "https://www.capitalchiro.com.au/", "Chiropractic care", "Not stated", "Use the official website contact details"),
  employer("enhance-healthcare-canberra", "Enhance Healthcare Canberra", "Mitchell", "https://www.enhance.com.au/", "Chiropractic, massage and exercise physiology", "Yes—multiple allied-health services are stated", "Use the official website contact details"),
  employer("canberra-spine-centre", "Canberra Spine Centre", "Canberra", "https://www.spinecentre.com.au/", "Chiropractic care", "Not stated", "Use the official website contact details"),
  employer("queanbeyan-chiropractic", "Queanbeyan Chiropractic", "Queanbeyan", "https://www.queanbeyanchiropractic.com.au/", "Chiropractic care and biofeedback services", "Shares rooms with another health service; integration not stated", "Use the official website contact details"),
];

const seekSearchUrl = "https://www.seek.com.au/chiro-jobs/in-All-Canberra-ACT";
const archivedBase = {
  ...reviewed,
  nextReviewDate: "2026-08-05",
  source: "SEEK Canberra chiropractic search results indexed February 2026",
  officialUrl: seekSearchUrl,
  sourceType: "Job board" as const,
  confidence: "Medium" as const,
  verificationStatus: "Archived" as const,
  vacancyStatus: "Archived" as const,
  publicationDate: null,
  closingDate: null,
  applicationUrl: seekSearchUrl,
  registrationRequirement: null,
  experienceRequirement: null,
  mentoringSupport: null,
  dataNotes: "Retained as an archived lead only because the indexed result is stale. It must not be presented as a current vacancy.",
};

export const chiropracticVacancies: ChiropracticVacancyRecord[] = [
  { ...archivedBase, id: "archived-avhs-chiropractor", exactTitle: "Chiropractor", employer: "Australian Veteran Health Services", location: "Deakin, ACT", employmentType: "Part-time", salary: "A$90,000–A$100,000 per year was displayed in the archived search result", workPattern: "Part-time was displayed in the archived search result" },
  { ...archivedBase, id: "archived-chiropractic-life-assistant", exactTitle: "Chiropractic Assistant", employer: "Chiropractic Life", location: "Woden, ACT", employmentType: "Casual", salary: "A$25–A$34 per hour was displayed in the archived search result", workPattern: "Casual was displayed in the archived search result" },
  { ...archivedBase, id: "archived-capital-chiro-reception", exactTitle: "Receptionist / Admin Assistant", employer: "Capital Chiropractic Centre", location: "Braddon, ACT", employmentType: "Part-time", salary: null, workPattern: "Permanent part-time was displayed in the archived search result" },
];

const conductSource = "https://www.chiropracticboard.gov.au/Codes-guidelines/Code-of-conduct.aspx";
export const chiropracticInterviewQuestions: InterviewQuestionRecord[] = [
  {
    ...reviewed, id: "chiro-interview-consent", question: "How would you explain a proposed assessment or care plan and obtain informed consent?", category: "Patient communication",
    whyAsked: "Tests whether the candidate can communicate clearly, respect patient choice and work within professional obligations.",
    answerFramework: ["Clarify the patient’s goals and concerns", "Explain options, material risks and alternatives in plain language", "Check understanding and voluntary agreement", "Document the discussion"],
    source: "Chiropractic Board of Australia Code of conduct", officialUrl: conductSource, sourceType: "Government",
  },
  {
    ...reviewed, id: "chiro-interview-red-flags", question: "How do you respond when an assessment identifies findings outside your scope or requiring referral?", category: "Clinical reasoning and referral",
    whyAsked: "Explores safe scope-of-practice decisions and collaboration with other health practitioners without asking for treatment advice.",
    answerFramework: ["Recognise limits and immediate safety concerns", "Explain the concern to the patient", "Escalate or refer through an appropriate pathway", "Document actions and follow-up"],
    source: "Chiropractic Board of Australia Code of conduct", officialUrl: conductSource, sourceType: "Government",
  },
  {
    ...reviewed, id: "chiro-interview-records", question: "What is your approach to accurate and confidential clinical records?", category: "Record keeping",
    whyAsked: "Assesses professional documentation, privacy and continuity-of-care awareness.",
    answerFramework: ["Record contemporaneously and objectively", "Include assessment, consent, decisions and follow-up", "Protect confidentiality and access", "Correct records transparently rather than obscuring changes"],
    source: "Chiropractic Board of Australia Code of conduct", officialUrl: conductSource, sourceType: "Government",
  },
  {
    ...reviewed, id: "chiro-interview-boundaries", question: "How would you maintain professional boundaries when a patient relationship becomes difficult?", category: "Ethics and boundaries",
    whyAsked: "Checks awareness of patient-centred conduct, boundaries and escalation.",
    answerFramework: ["Identify the boundary concern", "Keep communication professional and patient-centred", "Seek supervision or guidance where appropriate", "Document and escalate safety or conduct concerns"],
    source: "Chiropractic Board of Australia Code of conduct", officialUrl: conductSource, sourceType: "Government",
  },
];
