# Morning acceptance

Sprint 4 addition: enable Demo Mode in Settings before a presentation, confirm onboarding does not block the view, verify the Demo mode label is visible, and use “Reset demo data” to restore the portfolio workflow.

Run the app with `npm run dev` and use a fresh private-browser window for the onboarding checks.

## 3-minute critical checklist

| Step | Expected result |
| --- | --- |
| Open `/` at desktop width | The dashboard loads without a runtime error and the sidebar remains usable. |
| Complete or skip onboarding | The flow is bilingual, keyboard reachable, mobile-safe, and resumes at the saved step after refresh. |
| Switch EN / 中文, then refresh | The chosen language persists and the active career profile does not change. |
| Open `/opportunities` and one record | Seven individual match rows appear; every row shows result, evidence, and uncertainty. |
| Inspect a sample job or opportunity | “Sample data”, “Not a verified live vacancy”, and “Synthetic planning date” appear where applicable. |
| Open `/settings` | Theme, language, profile, backup, privacy, and reset controls render; existing local records remain intact. |

## 10-minute full checklist

| Step | Expected result |
| --- | --- |
| Visit `/jobs`, `/companies`, `/applications`, `/postgraduate`, `/profiles`, `/roadmap`, and `/settings` in English | Headings, controls, dialogs, validation, empty states, confirmations, and sample-data notices are readable and functional. |
| Repeat the route sweep in Simplified Chinese | Supported static interface copy is Chinese; names and user-entered content remain unchanged. |
| Use Jobs filters and open a job | Filtering works, sample provenance is visible, and save/add-to-application actions retain data. |
| Use Companies filters and save a note | The note stays attached to the active profile after refresh. |
| Create, edit, and delete a test application | Required-field validation and the delete confirmation use the selected language; other applications are unchanged. |
| Save a study program and inspect its deadline | The record is labelled as sample data and its deadline as a synthetic planning date. |
| Edit profile skills/projects | Validation and confirmations work without changing the other profile. |
| Add, complete, reopen, and delete a roadmap item | The item remains profile-specific and confirmation copy follows the selected language. |
| Test onboarding at 375px width | Every step fits without horizontal scrolling; Back, Continue, Skip, and Finish stay reachable. |
| Refresh midway through onboarding | The same step and entered values return. Finishing updates the selected profile or creates a new local profile. |
| Run `npm run test`, `npm run lint`, `npm run build`, and `npm run validate:data` | Every command exits successfully with no test, lint, type, build, or opportunity-data validation failures. |

## Desktop and mobile sign-off

- Desktop: check sidebar, dialogs, long translated labels, opportunity match rows, and onboarding at 1280px or wider.
- Mobile: check bottom navigation, filters, dialogs, tables/cards, and onboarding at 375px.
- English: no missing-key warnings should appear in the console.
- Simplified Chinese: no English translation key may be missing; the automated coverage test compares both dictionaries exactly.
