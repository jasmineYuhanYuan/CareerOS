# Agent Instructions for CareerOS

## Product objective

Build a reliable MVP for managing jobs, postgraduate applications and career planning.

## Engineering rules

- Use TypeScript.
- Prefer server components unless client-side state is required.
- Keep domain types in a shared types directory.
- Validate external data.
- Do not hard-code user-specific data into UI components.
- Seed data may contain the two initial test profiles.
- Keep job, university and application data source URLs.
- Add loading, empty and error states.
- Keep components small and reusable.
- Do not add AI features before the core CRUD workflows work.

## MVP priority

1. profile
2. jobs
3. applications
4. postgraduate programs
5. roadmap
6. dashboard personalisation

## Definition of done

A feature is complete when:
- it works for both initial profiles
- it supports empty states
- it persists data
- it has basic validation
- it is usable on desktop and mobile widths
