# CareerOS visual refresh

## Direction

The refreshed interface uses a youthful editorial direction: generous whitespace,
compact navigation, bold display typography and a restrained orange-red accent.
It takes broad inspiration from contemporary Chinese lifestyle applications
without copying any brand assets, layouts, illustrations, wording or protected
visual identity.

## Foundations

Global design tokens live in `src/app/globals.css` and cover:

- warm neutral backgrounds and white content surfaces
- near-black primary text and quieter secondary text
- orange-red actions and navigation emphasis
- green reserved for positive and completed states
- semantic warning and danger colours
- matching dark-mode values
- consistent radii, shadows and reduced-motion behaviour

Reusable primitives in `src/components/ui` provide cards, buttons, status badges,
filter chips, section headings, metrics, dialogs and mobile bottom sheets.

## Navigation and pages

- Desktop uses a slim persistent sidebar with an active-profile selector.
- Mobile uses a compact header, a five-destination bottom bar and a secondary
  navigation sheet.
- Dashboard, profiles, jobs, companies, applications, study, roadmap and settings
  share the same hierarchy and spacing system.
- Dense records become editorial lists and grouped mobile cards instead of
  compressed tables or boards.
- Dialogs render at the document root so editors remain bound to the viewport
  even when opened from scrolled or transformed content.

## Responsive and accessible behaviour

The layout is designed around 375, 430, 768, 1024 and 1440 pixel widths. Controls
use clear focus states and practical touch targets, semantic headings remain in
order, status is not conveyed by colour alone, and horizontal content is either
scrollable by design or replaced with a mobile-specific presentation. Empty,
loading and error states use the same shared visual language.

## Scope

This refresh changes presentation only. Profile-aware persistence, seed data,
validation, filtering, application tracking, program tracking, roadmap editing,
theme preferences, import/export and reset behaviour remain in place. It adds no
authentication, external API, scraping or AI integration.
