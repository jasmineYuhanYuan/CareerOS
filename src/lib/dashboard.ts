import { jobs, programs } from "@/data/seed";
import { opportunities } from "@/data/opportunities";
import type { DashboardDeadline, ProfileWorkspace } from "@/types/domain";
import { isJobRelevantToProfile, isOpportunityRelevantToProfile } from "@/lib/profile-eligibility";
import { documentIsReady } from "@/lib/document-evidence";

export interface ReadinessItem {
  key: "education" | "goals" | "locations" | "skills" | "projects" | "eligibility" | "links" | "resume";
  complete: boolean;
}

export interface RecentActivity {
  id: string;
  label: string;
  occurredAt: string;
  applicationTitle: string;
}

export function profileReadiness(workspace: ProfileWorkspace): ReadinessItem[] {
  const profile = workspace.profile;
  return [
    { key: "education", complete: Boolean(profile.university && profile.degree && profile.discipline) },
    { key: "goals", complete: profile.careerGoals.length > 0 },
    { key: "locations", complete: profile.preferredCities.length > 0 },
    { key: "skills", complete: profile.skills.length > 0 },
    { key: "projects", complete: profile.projects.length > 0 },
    { key: "eligibility", complete: Boolean(profile.workEligibility && !profile.workEligibility.toLowerCase().includes("confirm")) },
    { key: "links", complete: Boolean(profile.linkedInUrl || profile.githubUrl || profile.portfolioUrl) },
    { key: "resume", complete: workspace.documents.some((item) => item.documentType.includes("résumé") && documentIsReady(item)) },
  ];
}

export function recentApplicationActivity(workspace: ProfileWorkspace, limit = 6): RecentActivity[] {
  return workspace.applications
    .flatMap((application) => application.activity.map((event) => ({
      id: `${application.id}-${event.id}`,
      label: event.label,
      occurredAt: event.occurredAt,
      applicationTitle: application.jobTitle,
    })))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, limit);
}

export function aggregateDeadlines(workspace: ProfileWorkspace): DashboardDeadline[] {
  const deadlines: DashboardDeadline[] = [];
  for (const jobId of workspace.savedJobIds) {
    const job = jobs.find((item) => item.id === jobId);
    if (job?.deadline && isJobRelevantToProfile(workspace.profile, job)) deadlines.push({ id: `job-${job.id}`, title: `${job.title} sample deadline`, source: "Job", date: job.deadline });
  }
  for (const application of workspace.applications) {
    if (application.nextActionDate) deadlines.push({ id: `application-${application.id}`, title: application.nextAction || `${application.jobTitle} next action`, source: "Application", date: application.nextActionDate });
  }
  for (const programId of workspace.savedProgramIds) {
    const program = programs.find((item) => item.id === programId);
    if (program?.deadline) deadlines.push({ id: `program-${program.id}`, title: `${program.university}: ${program.programName}`, source: "Postgraduate", date: program.deadline });
  }
  for (const item of workspace.roadmapItems) {
    if (item.targetDate && item.status !== "Completed") deadlines.push({ id: `roadmap-${item.id}`, title: item.title, source: "Roadmap", date: item.targetDate });
  }
  for (const opportunityId of workspace.savedOpportunityIds) {
    const opportunity = opportunities.find((item) => item.id === opportunityId);
    if (opportunity?.deadline && isOpportunityRelevantToProfile(workspace.profile, opportunity)) deadlines.push({ id: `opportunity-${opportunity.id}`, title: opportunity.title, source: "Opportunity", date: opportunity.deadline });
  }
  for (const contact of workspace.contacts) {
    if (contact.nextFollowUpDate) deadlines.push({ id: `contact-${contact.id}`, title: `Follow up with ${contact.name}`, source: "Contact", date: contact.nextFollowUpDate });
  }
  return deadlines.sort((a, b) => a.date.localeCompare(b.date));
}
