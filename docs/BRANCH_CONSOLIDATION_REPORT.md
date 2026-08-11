# Branch Consolidation Report

## Release candidate base

`release/careeros-real-market-rc` was created from `codex/chinese-localisation-real-market-data` at `d1d189c`.

The ancestry is linear:

`feature/career-intelligence-platform` (`cbafa46`) → `codex/china-campus-recruiting` (`8c8e4d8`) → `codex/chinese-localisation-real-market-data` (`d1d189c`).

Because each newer branch already contains the earlier branch, no merge or cherry-pick was required. This avoids duplicate routes, models and migrations.

## Included functionality

- Career Intelligence, Knowledge Graph, target-specific Gap Analysis, Action Centre and Recruitment Calendar from the Career Intelligence branch.
- China Recruiting, import workflow, OA/interview intelligence and application pipeline from the China branch.
- Chinese-first presentation, nine verified China vacancies, source snapshots, review queues and verification documentation from the localisation/data branch.
- Sprint 11 Australian normalised market records, canonical coverage summary and maintainability extraction.

## Excluded work

- No commits were taken from older parallel design, audit or superseded Sprint 3 branches because their compatible work is already represented in the linear ancestry or they predate the current domain model.
- `main` was not merged into or modified by this release-candidate work.
- Amazon's graduate page with a passed commencement window and generic employer portals were excluded from active metrics.

## Conflict and migration handling

There were no Git conflicts. Existing persisted opportunity/application structures remain backward compatible: newly normalised fields are optional, and application source snapshots remain optional for older local records.
