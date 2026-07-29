# Sprint 8 — Verified Market Data and Career Action Workspace

Last verified: 30 July 2026

## Opportunity lifecycle

CareerOS derives one of seven lifecycle states from verified source metadata:
Open, Upcoming, Closing soon, Closed, Expired, Archived or Verification
required. A closing-soon window is 14 days. An undated record is not considered
open unless the official dataset explicitly records an open stage.

The current verified opportunity repository contains:

- 12 records in total;
- 9 Australian records;
- 3 Chinese records;
- 2 open Baidu 2027 role records;
- 2 upcoming Atlassian programme records;
- 1 archived ByteDance 2026 programme record.

The remaining Australian records are closed or require current-stage
verification. Archived opportunities are excluded from recommendations and
knowledge-graph relationships.

## Target-specific analysis

Gap Analysis now selects an exact verified opportunity, university programme or
the Australian chiropractor occupation pathway. Requirements, lifecycle
blockers and evidence come from that target's source record. Closed, expired or
archived targets are explicit blockers and cap readiness at 45%.

Unknown graduation timing, citizenship, work rights, academic thresholds and
registration data remain unknown. They are never silently converted into
failure.

## Application workspace

The application pipeline supports Interested, Researching, Preparing, Ready to
apply, Applied, OA invited, OA completed, Interview invited, Interviewing,
Reference check, Offer, Rejected, Withdrawn and Archived.

Application materials support Missing, Draft, Review needed, Ready, Submitted,
Outdated and Not applicable. Only Ready, Submitted and Not applicable satisfy
readiness. Draft never counts as Ready.

Interview and online-assessment sessions store type, provider, stage, scheduled
time, duration, status and preparation/outcome notes. Existing local state is
normalised from the previous pipeline without discarding applications.

## Action Centre and calendar

`/action-centre` combines due roadmap items, closing opportunities,
applications needing action, interview/OA preparation, profile and material
gaps, saved targets, follow-ups and recently verified opportunities.

Tommy additionally receives a Canberra clinic research workflow sourced from
the verified employer directory. Tracking a clinic creates a local outreach
contact; it never creates or implies a vacancy.

`/recruitment-calendar` separates verified dated events from records whose
dates have not been published and includes profile-specific interview/OA
sessions.

## Profile isolation

Yuhan's dashboard is limited to verified Australian and Chinese technology
targets and preparation. Tommy's dashboard focuses on Ahpra confirmations,
Canberra clinic research and outreach. Contacts, sessions, materials,
applications and actions remain inside their owning profile workspace.
