import { jobs, programs } from "@/data/seed";
import { opportunities } from "@/data/opportunities";
import type { DashboardDeadline, ProfileWorkspace } from "@/types/domain";

export function aggregateDeadlines(workspace: ProfileWorkspace): DashboardDeadline[] {
  const deadlines: DashboardDeadline[] = [];
  for (const jobId of workspace.savedJobIds) {
    const job = jobs.find((item) => item.id === jobId);
    if (job?.deadline) deadlines.push({ id: `job-${job.id}`, title: `${job.title} sample deadline`, source: "Job", date: job.deadline });
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
    if (opportunity?.deadline) deadlines.push({ id: `opportunity-${opportunity.id}`, title: opportunity.title, source: "Opportunity", date: opportunity.deadline });
  }
  for (const contact of workspace.contacts) {
    if (contact.nextFollowUpDate) deadlines.push({ id: `contact-${contact.id}`, title: `Follow up with ${contact.name}`, source: "Contact", date: contact.nextFollowUpDate });
  }
  return deadlines.sort((a, b) => a.date.localeCompare(b.date));
}
