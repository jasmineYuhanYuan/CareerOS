# CareerOS overnight Sprint 3 audit

Audit date: 29 July 2026  
Audited baseline: `main` at `439bed4`

This audit evaluates committed, runnable code rather than prior progress reports.
Uncommitted work on `feature/sprint-3-career-intelligence` is not classified as
complete until restored, tested and committed.

| Requirement | Status | Evidence |
| --- | --- | --- |
| Persistent English/Chinese switch | Partial | `src/providers/language-provider.tsx` stores `careeros-language`; shell labels switch and survive refresh, but the preference is outside the versioned export. |
| Central typed translations | Missing | Navigation uses a local map in `src/components/layout/navigation.ts`; there is no central typed dictionary. |
| Complete interface translation | Missing | Dashboard and all feature modules retain English static copy. |
| Locale-aware formatting | Missing | Components call `toLocaleDateString("en-AU")` directly. |
| Opportunities route | Missing | No `/opportunities` route exists on `main`. |
| Opportunity provenance/status | Partial | Jobs visibly say sample data, but there is no general provenance model or validator. |
| Match dimensions/confidence | Missing | `src/lib/match.ts` returns one score, strengths and gaps only. |
| Dashboard monthly timeline | Partial | `src/lib/dashboard.ts` aggregates dates; the UI presents upcoming dates but not a complete profile-specific monthly career timeline. |
| Contacts | Missing | No model, persistence or route. |
| Document records | Partial | Postgraduate checklist and application `cvVersion` exist; there is no career document-version tracker. |
| Storage migration | Missing | `src/lib/storage.ts` accepts only version 2 and falls back to seed data for other versions. |
| Import/export of Sprint 3 data | Missing | Version 2 export has no language, opportunity saves, contacts or document records. |
| Design-system documentation | Partial | `docs/VISUAL_REFRESH.md` exists; formal token/component documentation is missing. |
| Localisation documentation | Missing | No `docs/I18N.md`. |
| Data-provenance documentation | Missing | No `docs/DATA_PROVENANCE.md`. |
| Sprint 3 tests | Missing | Eight tests cover Sprint 2 matching, storage, isolation and deadlines only. |
| `npm run validate:data` | Missing | No script in `package.json`. |
| Jobs/applications/study/roadmap persistence | Complete | `src/providers/careeros-provider.tsx` and versioned local storage support these existing Sprint 2 workflows. |
| Responsive application shell | Complete | Desktop sidebar, mobile header/bottom navigation and shared dialogs are committed and built. |

## Risk findings

- Unsupported storage versions currently fall back to seeds. A Sprint 3 schema
  change must include explicit migration so valid Sprint 2 edits are preserved.
- Shell-only language switching can give the impression that the full interface
  is bilingual when feature content remains English.
- All bundled jobs/programs are sample planning records. They must not be
  described as current vacancies, verified deadlines or admissions facts.
- Contacts and document records require profile ownership validation during
  import, not only UI-level filtering.

## Recommended overnight order

1. Restore and review the existing Sprint 3 work.
2. Complete versioned storage migration and profile-isolation tests.
3. Complete typed bilingual coverage and locale formatting.
4. Validate the curated opportunity architecture and interactive browser.
5. Harden contacts, documents, dashboard and settings.
6. Run browser QA before any merge to `main`.
