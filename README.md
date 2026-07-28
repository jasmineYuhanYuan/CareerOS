# CareerOS

CareerOS is an AI-powered career operating system for students and graduates.

It brings job discovery, application tracking, postgraduate planning, skills development, and personalised career guidance into one platform.

## Initial users

### Yuhan Yuan
- University: UNSW
- Program: Bachelor of Computer Science
- Target paths: AI Product Manager, Technical Product Manager, Software Engineer
- Additional goal: postgraduate study planning
- Relevant projects: WearAgain, Unify

### Chiropractic graduate profile
- University: Macquarie University
- Program level: Postgraduate
- Field: Chiropractic
- Current goal: Find relevant graduate or early-career work in Australia

## MVP

- Dashboard
- Career profiles
- Job database
- Company database
- Application tracker
- Postgraduate program tracker
- Career roadmap

## Planned AI features

- Job-profile match analysis
- CV tailoring
- Skill-gap analysis
- Postgraduate program matching
- Personalised action planning
- Interview preparation

## Proposed stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Status

The first application foundation is complete:

- responsive desktop and mobile application shell
- profile-aware dashboard for both initial seed profiles
- routes for profiles, jobs, companies, applications, postgraduate planning, roadmap and settings
- typed and validated local seed data
- loading, empty and error states

The current implementation intentionally uses local mock data only. Supabase,
authentication, scraping and AI integrations are not included yet.

## Run locally

Requirements:

- Node.js 20.9 or newer
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Quality checks

Run the linter:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Project structure

- `src/app` — App Router pages, layout and route states
- `src/components` — reusable shell, profile, dashboard and UI components
- `src/data` — validated seed profiles and typed dashboard mock data
- `src/types` — shared CareerOS domain types
- `SEED_PROFILES.json` — initial test profiles

Planning documents in the repository remain the source of truth for future MVP
work.
