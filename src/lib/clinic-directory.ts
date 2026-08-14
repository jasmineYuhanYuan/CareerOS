import { canberraChiropracticEmployers, chiropracticVacancies } from "@/data/verified/chiropractic";
import { TOMMY_ID } from "@/data/seed";
import type { CareerProfile } from "@/types/domain";

export const TOMMY_CLINIC_DIRECTORY_ROUTE = "/clinics#clinic-directory";
export const TOMMY_ADD_CLINIC_ROUTE = "/clinics#add-target-clinic";

export function clinicsForProfile(profile: CareerProfile) {
  return profile.id === TOMMY_ID ? canberraChiropracticEmployers : [];
}

export function verifiedCurrentChiropracticVacancies(): number {
  return chiropracticVacancies.filter((item) => item.vacancyStatus === "Current").length;
}

export function archivedChiropracticLeads() {
  return chiropracticVacancies.filter((item) => item.vacancyStatus === "Archived");
}
