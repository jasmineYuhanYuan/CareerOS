import { verifiedChinaCampusOpportunities } from "@/data/china-recruiting/verified-opportunities";
import { verifiedCareerOpportunities } from "@/data/verified/opportunities";
import {
  canberraChiropracticEmployers,
  chiropracticVacancies,
} from "@/data/verified/chiropractic";
import { deriveOpportunityLifecycle } from "@/lib/opportunity-lifecycle";

export function realMarketCoverage(
  referenceDate = new Date().toISOString().slice(0, 10),
) {
  const chinaActive = verifiedChinaCampusOpportunities.filter((item) =>
    ["Open", "Closing soon"].includes(item.verificationStatus),
  );
  const australia = verifiedCareerOpportunities.filter(
    (item) => item.country === "Australia",
  );
  const australiaWithLifecycle = australia.map((item) => ({
    item,
    lifecycle: deriveOpportunityLifecycle(item, referenceDate),
  }));
  const australiaActive = australiaWithLifecycle.filter(({ lifecycle }) =>
    ["Open", "Closing soon"].includes(lifecycle),
  );
  const australiaUpcoming = australiaWithLifecycle.filter(
    ({ lifecycle }) => lifecycle === "Upcoming",
  );
  return {
    china: {
      active: chinaActive.length,
      upcoming: verifiedChinaCampusOpportunities.filter(
        (item) => item.verificationStatus === "Upcoming",
      ).length,
      closingSoon: verifiedChinaCampusOpportunities.filter(
        (item) => item.verificationStatus === "Closing soon",
      ).length,
      archived: verifiedCareerOpportunities.filter(
        (item) =>
          item.country === "China" && item.verificationStatus === "Archived",
      ).length + verifiedChinaCampusOpportunities.filter(
        (item) => ["Closed", "Archived"].includes(item.verificationStatus),
      ).length,
      companies: new Set(chinaActive.map((item) => item.company)).size,
      product: chinaActive.filter((item) => item.category === "Product").length,
      aiProduct: chinaActive.filter((item) => item.category === "AI Product")
        .length,
      softwareEngineering: chinaActive.filter(
        (item) => item.category === "Software Engineering",
      ).length,
      backend: chinaActive.filter((item) => item.category === "Backend").length,
      dataAi: chinaActive.filter((item) =>
        ["Data", "AI"].includes(item.category),
      ).length,
      noPublicDeadline: chinaActive.filter((item) => !item.deadline).length,
    },
    australia: {
      active: australiaActive.length,
      upcoming: australiaUpcoming.length,
      closingSoon: australiaWithLifecycle.filter(
        ({ lifecycle }) => lifecycle === "Closing soon",
      ).length,
      archived: australiaWithLifecycle.filter(({ lifecycle }) =>
        ["Archived", "Closed", "Expired"].includes(lifecycle),
      ).length,
      companies: new Set(australiaActive.map(({ item }) => item.company)).size,
      product: australiaActive.filter(
        ({ item }) => item.roleFamily === "Product",
      ).length,
      aiProduct: australiaActive.filter(
        ({ item }) => item.roleFamily === "AI Product",
      ).length,
      softwareEngineering: australiaActive.filter(
        ({ item }) => item.roleFamily === "Software Engineering",
      ).length,
      backend: australiaActive.filter(
        ({ item }) => item.roleFamily === "Backend",
      ).length,
      dataAi: australiaActive.filter(
        ({ item }) => item.roleFamily === "Data / AI",
      ).length,
      noPublicDeadline: australiaActive.filter(({ item }) => !item.deadline)
        .length,
    },
    tommy: {
      clinicsTracked: canberraChiropracticEmployers.length,
      clinicsResearched: canberraChiropracticEmployers.filter(
        (item) => item.verified,
      ).length,
      outreachReadyClinics: canberraChiropracticEmployers.filter((item) =>
        Boolean(item.contactInformation && item.website),
      ).length,
      activeVerifiedVacancies: chiropracticVacancies.filter(
        (item) => item.vacancyStatus === "Current",
      ).length,
      archivedVacancyLeads: chiropracticVacancies.filter((item) =>
        ["Archived", "Expired"].includes(item.vacancyStatus),
      ).length,
    },
  };
}
