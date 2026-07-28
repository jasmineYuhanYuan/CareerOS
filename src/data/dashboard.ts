import type { ProfileDashboardData } from "@/types/profile";

export const dashboardData: Readonly<Record<string, ProfileDashboardData>> = {
  "yuhan-yuan": {
    applicationSummary: [
      { status: "Saved", count: 8 },
      { status: "Preparing", count: 3 },
      { status: "Applied", count: 5 },
      { status: "Interview", count: 1 },
    ],
    deadlines: [
      { id: "y1", title: "Graduate Product Program", organisation: "Atlassian", dateLabel: "04 Aug", dateTime: "2026-08-04", category: "Job" },
      { id: "y2", title: "Master of IT application", organisation: "UNSW", dateLabel: "12 Aug", dateTime: "2026-08-12", category: "Postgraduate" },
      { id: "y3", title: "Portfolio case study review", organisation: "CareerOS", dateLabel: "15 Aug", dateTime: "2026-08-15", category: "Task" },
    ],
    nextActions: [
      { id: "ya1", title: "Tailor your product CV", detail: "Bring the WearAgain outcomes and discovery work forward.", dueLabel: "Today", tone: "orange" },
      { id: "ya2", title: "Compare postgraduate pathways", detail: "Shortlist three programs by entry requirements and cost.", dueLabel: "This week", tone: "green" },
      { id: "ya3", title: "Prepare interview stories", detail: "Draft concise examples for ownership, teamwork and ambiguity.", dueLabel: "Next", tone: "gold" },
    ],
  },
  "chiropractic-graduate-profile": {
    applicationSummary: [
      { status: "Saved", count: 6 },
      { status: "Preparing", count: 2 },
      { status: "Applied", count: 4 },
      { status: "Interview", count: 2 },
    ],
    deadlines: [
      { id: "c1", title: "Associate Chiropractor", organisation: "Northern Beaches Health", dateLabel: "02 Aug", dateTime: "2026-08-02", category: "Job" },
      { id: "c2", title: "Registration documents", organisation: "AHPRA", dateLabel: "09 Aug", dateTime: "2026-08-09", category: "Task" },
      { id: "c3", title: "Clinic interview preparation", organisation: "Inner West Chiropractic", dateLabel: "11 Aug", dateTime: "2026-08-11", category: "Task" },
    ],
    nextActions: [
      { id: "ca1", title: "Confirm registration evidence", detail: "Review the documents required for your AHPRA application.", dueLabel: "Today", tone: "orange" },
      { id: "ca2", title: "Refine your clinical CV", detail: "Highlight patient communication and supervised placement hours.", dueLabel: "This week", tone: "green" },
      { id: "ca3", title: "Research target clinics", detail: "Add five clinics aligned with your preferred treatment approach.", dueLabel: "Next", tone: "gold" },
    ],
  },
};
