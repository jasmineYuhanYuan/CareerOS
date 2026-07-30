# Product audit — Sprint 9

Reviewed 30 July 2026 against every generated route, desktop/mobile navigation, both profiles and both languages.

## Critical

- **Resolved — verification labels were misleading.** `/companies` labelled verified employers as sample data; `/postgraduate` labelled verified university records as sample/synthetic. Labels now reflect record provenance.
- **Resolved — sample discovery was implicit.** Sample organisations are excluded by default and require an explicit “Include sample organisations” choice.
- **Resolved — scores could be read as outcomes.** Job, programme and gap-analysis scores now say planning alignment/readiness, identify the exact target, and state that they do not predict admission, employability or hiring.

## High

- **Resolved — navigation overload.** Seven destinations remain primary. Research and workspace tools are grouped on desktop and consistently exposed from the mobile “More” sheet.
- **Resolved — source validation did not cover the whole repository.** The source-health index now checks URL shape, names, review dates and archived/open conflicts.
- **Resolved — application statistics could include demo records.** Pipeline analytics use user-created records only, exclude terminal records from active interpretation, and suppress average response time below three valid intervals.
- **Resolved — release command omitted TypeScript.** `npm run verify:rc` includes tests, lint, typecheck, build and data gates.

## Medium

- Interview coverage remains narrow: Xero has official stage evidence; other company records intentionally retain unknown stages.
- Active opportunity volume is small because general careers portals are not counted as active vacancies.
- Chinese and English static-copy coverage remains uneven in several secondary record editors.
- Action dismissal/deferment history is not yet modelled as a first-class domain object.
- The company browser still uses a compatibility organisation index separate from Career Intelligence.

## Low

- Some route components remain client components because local persistence and interactive filtering are client-side.
- Dense editor dialogs would benefit from further mobile field grouping.

## Route disposition

All 20 generated routes remain available. `/chiropractic` remains a contextual redirect/tool and is not global navigation. Tommy-only clinic and registration content remains inside Tommy’s action/roadmap experience.
