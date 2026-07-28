# Accessibility review

Reviewed 29 July 2026 at 375, 430, 1024 and 1440 pixels.

- Native buttons, inputs and selects have keyboard activation and practical
  touch targets. The language toggle exposes a current-action accessible name.
- Dialogs have modal semantics, labelled headings, Escape handling, bounded
  height and scrolling. The shared portal keeps them inside the viewport.
- Focus uses the blue accent and status badges include visible text.
- Mobile navigation respects bottom safe-area insets. No audited route produced
  horizontal page overflow.
- Chinese navigation wraps without uppercase transformation. User-entered
  English content remains unchanged by design.

Open issue: several legacy feature labels and semantic domain values remain
English in Chinese mode. This is a localisation completeness issue and can also
reduce comprehension for Chinese-only screen-reader users.
