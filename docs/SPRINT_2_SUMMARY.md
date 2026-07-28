# Sprint 2 — Functional CareerOS MVP

## Features implemented

- Editable, persistent profiles with structured skills and projects
- Sixteen profile-aware sample jobs with search, filters, sorting and details
- Deterministic estimated profile matching with strengths and investigation areas
- Company and clinic browser with per-profile notes
- Job application board/list tracker with activity history
- Ten sample postgraduate programs and an application/document tracker
- Profile-aware postgraduate empty state for Tommy
- Editable monthly roadmap with status, category and priority controls
- Action-centre dashboard with live local metrics and combined deadlines
- Theme/default-profile preferences, JSON backup/import and reset controls

## Architecture decisions

The App Router pages remain thin and render focused feature components. Shared
domain types live in `src/types/domain.ts`. Client-side workflows use a single
`CareerOSProvider`, while deterministic calculations and validation remain pure
functions under `src/lib` for direct testing.

No backend, authentication, scraping, AI service or automatic submission was
added.

## Storage design

One versioned local document is stored under `careeros:mvp`. Its `profiles`
record contains independent workspaces keyed by immutable profile ID. Every
application, postgraduate application and roadmap item is validated against its
owning profile ID during import. Invalid JSON, unsupported versions and
cross-profile records fall back safely or are rejected before replacement.

Reset operations rebuild state from typed seed factories. Export includes the
storage version and both profile workspaces.

## Data model changes

Sprint 2 adds structured models for profiles, skills, projects, jobs,
organisations, applications and activity events, postgraduate programs and
documents, roadmap items, preferences, match results and dashboard deadlines.
All opportunity and study records are clearly identified as sample planning
data.

## Test coverage

Vitest covers:

- profile-aware job filtering
- deterministic match scoring
- storage parsing and fallback
- profile workspace separation
- combined dashboard deadline ordering
- import validation

## Dependency audit

`npm audit fix` found no non-breaking update path. Twelve high-severity findings
remain:

- development toolchain: ESLint and transitive `minimatch`/`brace-expansion`
- production dependency tree: Next.js transitive `postcss` and `sharp`

npm proposes forced breaking changes, including incompatible framework
downgrades or an ESLint major upgrade. Those changes were not applied. The
findings require upstream-compatible releases and should be reviewed before
deployment.

## Known limitations

- localStorage is device- and browser-specific
- sample records are not verified live opportunities
- application history records four core change types, not every field edit
- no file uploads, cloud sync, authentication or multi-user collaboration
- matching is a planning heuristic, not an employer assessment

## Recommended Sprint 3 priorities

1. Conduct usability sessions with both initial profiles.
2. Refine data validation and matching weights from real feedback.
3. Add Supabase persistence and authentication after local workflows stabilise.
4. Add document metadata and reminders without automatic submission.
5. Resolve dependency advisories through supported framework/toolchain updates.
