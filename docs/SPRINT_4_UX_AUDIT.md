# Sprint 4 interface quality audit

Date: 29 July 2026  
Baseline: `5ad747c` on `main`

## Cross-product findings

| Severity | Finding | Impact |
| --- | --- | --- |
| High | Static interface copy is still mixed English/Chinese across legacy forms, statuses, filters and helper text. | Chinese mode feels incomplete and some controls become harder to scan. |
| High | Abstract text glyphs are used as navigation and empty-state icons. | Icon meaning and visual consistency are weak. |
| High | Dashboard readiness is a percentage without actionable criteria; recent activity is absent. | The primary portfolio screen does not explain what users should do next. |
| High | Save, update, delete and reset actions usually lack accessible success feedback. | Users cannot reliably confirm state changes. |
| Medium | Cards, panels and page sections use inconsistent spacing and hierarchy. | The product resembles a collection of CRUD screens rather than one system. |
| Medium | Loading is represented by generic page text rather than layout-matched skeletons. | Navigation feels less polished. |
| Medium | Long profile names have limited room in the sidebar and dashboard selector. | Tommy’s full name can clip at common widths. |
| Medium | Uppercase/letter-spaced eyebrow treatment is applied without a Chinese-specific override. | Chinese presentation feels visually unnatural. |
| Low | Motion is mostly limited to page entry and card hover. | State changes feel abrupt, although reduced-motion support already exists. |

## Route audit

### Dashboard `/`

- Strengths: contextual greeting, profile-aware content, compact overview, responsive recommendation row.
- High: Today’s Focus lacks urgency states and translated accessible completion labels.
- High: readiness is percentage-only and combines unrelated roadmap completion with profile setup.
- High: no recent local activity.
- Medium: recommendation cards omit verification confidence and top match evidence.
- Medium: timeline rows have equal weight and untranslated stored-source labels are not clearly distinguished.
- Medium: desktop header/profile selector balance leaves avoidable blank space.
- Accessibility: completion controls need state-independent names and visible semantic urgency.
- Portfolio weakness: strongest route does not yet tell a complete “attention → evidence → action” story.

### Jobs `/jobs`

- Strengths: profile-aware filters, deterministic match, save/application actions.
- High: many filters, sort values, dialog headings and helper labels remain English in Chinese mode.
- High: sample warnings repeat across badge, organisation name and descriptions.
- Medium: filter panel consumes too much vertical space and has no clear-all action.
- Medium: card action hierarchy is split between details and application actions.
- Accessibility: save glyph depends on `○/●`; needs a consistent icon and feedback.

### Opportunities `/opportunities`

- Strengths: provenance fields and seven transparent match dimensions.
- High: raw evidence and domain values remain visually mixed with translated interface labels.
- High: numerical score can appear overly certain when eligibility is unknown.
- Medium: cards repeat sample and verification labels.
- Medium: details are dense on mobile and section order could better support decision-making.
- Accessibility: evidence structure is semantic but long rows need improved mobile reading order.

### Applications `/applications`

- Strengths: profile isolation, activity history, board/list and mobile grouped view.
- High: empty state is sparse and lacks direct routes to create or browse jobs.
- High: status values, table labels and form fields are only partially translated.
- Medium: empty board columns have no guidance; next action and update dates are visually weak.
- Medium: create form lacks clear grouping between opportunity, planning and notes.
- Accessibility: validation needs explicit input relationships; confirmations need translated copy throughout.

### Study `/postgraduate`

- Strengths: profile-aware pathway, saved programs, applications and document checklist.
- Critical: Tommy’s Chinese view includes an English pathway explanation.
- High: tabs, filters, statuses, requirements and document names are mixed-language.
- Medium: program cards look too similar to job cards and sample provenance repeats.
- Medium: document checklist supports only boolean state, so “not required/unknown” cannot be represented without a data-model change.
- Mobile: action clusters can become dense.

### Companies `/companies`

- Strengths: organisation filtering, profile suitability and private notes.
- High: filter controls and dialog copy are only partially translated.
- High: “(Sample)” in names plus a sample badge duplicates provenance.
- Medium: relevant-role and saved-note signals are low contrast.
- Empty state: plain bordered paragraph without recovery action.

### Roadmap `/roadmap`

- Strengths: editable timeline, status/priority and profile isolation.
- High: domain values and editor labels remain mixed-language.
- Medium: timeline grouping is useful but lacks urgency labels and quick navigation.
- Medium: destructive actions are visually close to routine actions.
- Accessibility: timeline marker colour is not the only status signal, but completion name should remain clear.

### Contacts `/contacts`

- Strengths: appropriate local CRM scope and follow-up fields.
- High: editor/status/relationship copy is not fully translated.
- Medium: empty state does not explain useful contact types or next step.
- Medium: cards need stronger follow-up and notes hierarchy.

### Documents `/documents`

- Strengths: records metadata without implementing prohibited uploads.
- High: types, statuses and editor copy are not fully translated.
- Medium: empty state does not offer résumé/transcript/portfolio starter actions.
- Medium: version and update date hierarchy is weak.
- Accessibility: external link purpose should be explicit.

### Profile `/profiles`

- Strengths: rich profile data, skills/projects separation and registration context.
- High: most editor fields, validation-adjacent hints and actions remain English.
- High: software-specific project labels are not appropriate for Tommy’s clinical experience.
- Medium: metadata is spread across sections and passive “Not added” values.
- Medium: long name and preferred-name presentation needs more resilient wrapping.
- Portfolio weakness: profile content is comprehensive but not yet presented like a polished portfolio.

### Settings `/settings`

- Strengths: local privacy explanation, export/import, theme/language and destructive confirmations.
- High: Demo Mode is absent.
- High: success/error feedback is inline but semantically styled as success for failures.
- Medium: cards repeat eyebrow/title text and lack clear group priority.
- Accessibility: import result should use status or alert according to outcome.

## Responsive and theme findings

- Desktop (1024–1440): sidebar is slightly wide relative to content; main max-width is appropriate.
- Tablet (768): mobile navigation is active while dense page controls frequently form two-column layouts; dialog spacing needs review.
- Mobile (375–430): bottom navigation safe-area handling is good; action clusters and long Chinese labels require more wrapping room.
- Light mode: token direction is sound, but the focus colour still contains an old orange value.
- Dark mode: charcoal/slate foundation is appropriate; semantic soft colours need contrast verification.

## Recommended implementation order

1. Correct focus/semantic tokens, typography, spacing and icon system.
2. Harden shell, profile selector and language control.
3. Rebuild Dashboard hierarchy and supporting calculations.
4. Consolidate sample provenance and improve discovery details.
5. Improve empty states, feedback and form structure.
6. Complete static bilingual coverage and accessibility review.
7. Add safe Demo Mode, presentation data checks and portfolio documentation.
