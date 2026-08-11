# Component Architecture

## Responsibility boundaries

- `application-tracker.tsx` owns persistence orchestration, editor state and application workflow actions.
- `application-overview.tsx` owns application filters, view selection and summary metrics. It receives values and callbacks and does not access storage directly.
- Opportunity lifecycle, market coverage, ranking and import rules remain in `src/lib` rather than UI components.
- Verified source records live in `src/data/verified`; the adapter in `src/data/opportunities.ts` exposes a backward-compatible shared opportunity shape.

## Normalisation strategy

Verified opportunities now support optional `profileScope`, `officialApplyUrl`, `openingDate`, `publishedDate`, `roleFamily`, `graduationCohort`, `coreRequirements` and `visaStatement`. Older data remains valid because these additions are optional.

The normalisation adapter maps source records to the existing Opportunity vocabulary:

| Normalised concept | Existing Opportunity field                                        |
| ------------------ | ----------------------------------------------------------------- |
| company            | `organisationName`                                                |
| role               | `title`                                                           |
| location           | `locationText`                                                    |
| officialApplyUrl   | `sourceUrl`                                                       |
| verifiedAt         | `lastVerifiedAt`                                                  |
| lifecycle          | derived from `applicationStage`, deadline and verification status |
| profileScope       | `suitableProfileIds`                                              |

Further component extraction should be driven by behaviour changes and tests rather than line count alone. The release candidate intentionally avoids a broad rewrite of the stable job and China Recruiting workspaces.
