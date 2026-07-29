# Sprint 4 summary

## Visual improvements

- Hardened the blue-first semantic tokens, focus colour and dark slate foundation.
- Added a consistent inline SVG navigation icon family.
- Standardised restrained elevation, 180ms ease-out transitions and Chinese typography treatment.
- Reduced sidebar footprint and improved selected-state and long-name handling.

## Dashboard improvements

- Today’s Focus now orders dated actions and communicates overdue, today and upcoming states.
- Overview metrics link directly to the relevant workflow and include useful context.
- Recommendations show category, date, confidence-aware match and a top reason.
- Profile readiness is an eight-item actionable checklist.
- Recent Activity is derived only from local application events.

## Route-by-route changes

- Jobs: consolidated sample provenance and cleaned organisation presentation.
- Opportunities: preserved transparent seven-dimension details.
- Applications: action-led empty state and creation feedback.
- Study: translated Tommy’s profile-aware clinical pathway.
- Companies: removed visible duplicate “(Sample)” suffix.
- Profile: save feedback and resilient long-name presentation.
- Settings: persistent safe Demo Mode and import feedback.
- All routes benefit from hardened shell, loading skeleton and motion rules.

## Responsive and bilingual verification

The acceptance matrix covers 375, 430, 768, 1024 and 1440px; Yuhan and Tommy; English and Simplified Chinese; light and dark themes. Static dictionary parity remains enforced. Stored user/seed text remains in its source language.

## Motion, loading and feedback

Motion uses 150–220ms-style ease-out transitions, subtle card lift and an initial progress reveal. Reduced-motion collapses animation duration. A reusable skeleton mirrors card layouts. Accessible toast feedback covers creation, profile save and import results.

## Accessibility

Focus colour, icon names, completion labels, textual urgency, touch targets, Chinese letter spacing, safe areas and live feedback were reviewed. See `SPRINT_4_ACCESSIBILITY.md`.

## Tests

Tests cover typed translations, storage migration, profile separation, deterministic matching, opportunity dimensions, readiness, activity ordering and sample-label consolidation. Lint, build and opportunity-data validation are required for acceptance.

## Known limitations and future priorities

CareerOS remains browser-local, without authentication, cloud sync, live vacancy verification, AI APIs, binary uploads or automatic applications. Future work should prioritise validation semantics and user research before expanding scope.
