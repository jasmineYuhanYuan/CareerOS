# CareerOS portfolio case study

## Problem

Students and early-career professionals often divide career planning across job boards, notes, spreadsheets and university pages. This makes next actions, evidence and deadlines difficult to see together.

## Users

CareerOS demonstrates two distinct planning contexts: Yuhan, a computer-science student exploring technology and postgraduate pathways, and Tommy, a chiropractic postgraduate preparing for clinical work and registration-related steps.

## Product goal and scope

The goal is a calm, local-first workspace for structured career planning. Scope includes profile-aware discovery, applications, study, organisations, roadmap, contacts, document metadata and bilingual English/Simplified Chinese presentation.

## Key workflows

- Switch between isolated career profiles.
- Review clearly labelled sample opportunities and deterministic match evidence.
- Save opportunities and create application records.
- Plan dated roadmap actions and monitor deadlines.
- Maintain professional contacts and document-version metadata.
- Review profile readiness through actionable criteria.

## Design decisions

The interface uses restrained blue only for selection, focus and primary action. White cards sit on a cool-grey background with subtle borders. Semantic colours communicate success, urgency and danger. Typography favours moderate weight and generous line height in both languages.

## Bilingual architecture

English is the typed source dictionary. The Simplified Chinese dictionary must contain exactly the same keys, enforced by TypeScript and an automated coverage test. Stored user and seed content remains unchanged so translation never mutates data.

## Profile-aware personalisation

Every saved record belongs to one profile workspace. Matching evaluates goals, discipline, skills, location, projects, eligibility confidence and opportunity-type preference without an external model.

## Opportunity provenance

Sample records are explicitly labelled and synthetic dates are distinguished from verified live vacancy deadlines. CareerOS does not scrape or claim live availability.

## Accessibility

The product includes keyboard operation, visible focus, labelled dialogs, reduced-motion behaviour, approximately 44px touch targets and live-region feedback.

## Technical architecture and testing

CareerOS uses Next.js App Router, React, TypeScript, Tailwind CSS and browser localStorage. Vitest covers storage migration, profile separation, deterministic matching, translation completeness, readiness, activity ordering and data validation. ESLint and production builds are part of acceptance.

## Limitations

There is no authentication, cloud sync, live vacancy verification, external AI API, binary upload or automatic application submission. Browser-local data can be lost when site storage is cleared. The demo represents workflows, not real user adoption or outcomes.

## Future roadmap

Potential future work includes an intentionally designed backend and authenticated sync, only after privacy, provenance and migration requirements are defined. Those capabilities are outside the current portfolio MVP.
