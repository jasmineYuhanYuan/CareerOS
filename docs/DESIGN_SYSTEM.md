# CareerOS design system

## Sprint 4 hardened rules

- Use the cool-grey background, white surfaces and subtle slate panels to establish hierarchy.
- Reserve blue for logo emphasis, primary action, selection, links and focus.
- Use 18–22px card radii, 12–16px control radii and subtle borders before shadows.
- Use the spacing scale 4, 8, 12, 16, 20, 24, 32, 40, 48 and 64.
- Motion uses 150–220ms ease-out and respects `prefers-reduced-motion`.
- Use the shared inline SVG icon family; do not introduce emoji or abstract glyphs as core icons.
- Chinese eyebrows do not use uppercase or artificial letter spacing.

## Principles

Calm, professional, clear, supportive and technology-oriented without feeling
corporate-heavy or entertainment-oriented.

## Foundations

Tokens in `src/app/globals.css` define the cool background, surfaces, primary and
secondary text, borders, blue accent/hover/soft states, semantic success,
warning and danger colours, and dark-mode equivalents. Blue is reserved mainly
for branding, primary actions, active controls, focus and links.

DM Sans is the body face and Manrope is the display face. Spacing follows a
four-point base with common eight-point increments. Controls target at least
44px; cards, badges, filters, dialogs, forms, navigation, bottom sheets,
timelines and opportunity cards share tokens and reusable primitives.

Mobile layouts support safe-area padding and wrapping at 375px. Tablet layouts
expand progressively; the persistent sidebar begins at 1024px. Long Chinese
labels wrap naturally without uppercase transforms or artificial tracking.
