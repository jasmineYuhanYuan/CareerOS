# Sprint 4 accessibility review

## Checks performed

- Keyboard navigation across navigation, profile/language selectors, cards, dialogs and forms.
- Visible `:focus-visible` treatment in light and dark themes.
- Dialog names, descriptions, Escape close behaviour and minimum touch targets.
- Status communication through text as well as semantic colour.
- Mobile safe-area handling and 375–1440px overflow checks.
- Reduced-motion behaviour for page entry, hover transitions and progress reveals.
- Accessible live feedback for save/import actions.
- Long English and Chinese labels and profile names.

## Issues fixed

- Replaced the legacy orange focus ring with a blue, contrast-visible token.
- Replaced abstract navigation glyphs with a consistent inline SVG icon family.
- Added accessible toast roles (`status` for success and `alert` for failure).
- Added translated task-completion names and textual urgency states.
- Kept 44px-equivalent touch targets for primary interactive controls.
- Removed letter spacing and uppercase transformation from Chinese eyebrows.
- Added full-name tooltip and resilient width handling to the profile selector.
- Added reduced-motion handling to new progress and transition effects.

## Known limitations

- Native confirmation dialogs inherit browser behaviour and cannot be styled.
- Some validation errors are visually associated by proximity rather than `aria-describedby`.
- User-entered and seeded source-language content is intentionally not translated.
- Colour contrast was checked against tokens and browser rendering, not with assistive-technology user research.
