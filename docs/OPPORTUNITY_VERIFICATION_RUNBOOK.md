# Opportunity Verification Runbook

## Evidence required

A current opportunity needs a job-specific official vacancy page or official application action. A careers homepage, target-company entry, search result, historical campaign announcement or community post is not an active vacancy.

Capture the official title, job ID when present, employer, business group, location, responsibilities, requirements, published date, public deadline, official action URL, source type, verification time and next review date. Unknown values remain `null` or “Not published”.

## Lifecycle decisions

| Lifecycle             | Verification rule                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Open                  | Official job-specific page has a working application action and no evidence that the window ended. Review every 3–7 days.      |
| Upcoming              | Official source explicitly announces a future opening date. Review weekly; never infer an opening from prior years.            |
| Closing soon          | Open record with an official deadline within seven days. Re-check daily.                                                       |
| Closed                | Official source explicitly says applications are closed or the official deadline has passed. Exclude from Today.               |
| Archived              | Historical or superseded record retained for provenance. Exclude from active metrics and recommendations.                      |
| Verification required | A programme or portal is real but current vacancy/application state cannot be confirmed. Exclude from Today until re-verified. |

## Review workflow

1. Open the stored official job URL, not a search-result cache.
2. Confirm job identity and application action.
3. Compare title, job ID, location, requirements and dates with the stored record.
4. Preserve published values exactly; never manufacture a deadline, salary, eligibility or opening state.
5. Update `lastVerifiedAt`, `nextReviewDate`, `sourceStatus` and lifecycle.
6. If a listing disappears, determine whether the official source says Closed; otherwise use Verification required, then Archive once confirmed historical.
7. Preserve the application source snapshot even if the live listing later changes.

For Australia, also compare the advertised commencement window with the review date. A reachable page with an already-passed start window is not automatically current. Government `Upcoming` records require an explicitly published future opening date and retain citizenship and clearance wording exactly as published.

Community material may inform interview preparation but cannot establish that a vacancy is open. Interview intelligence is reviewed every 90 days and must retain its evidence class.
