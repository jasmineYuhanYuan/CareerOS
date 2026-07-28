# CareerOS

CareerOS is a local-first career planning workspace for students and graduates.
It brings profile management, sample job research, applications, postgraduate
planning and an editable roadmap into one responsive product.

The current MVP supports two independent test profiles:

- Yuhan Yuan — Computer Science, product, software and postgraduate pathways
- Taicheng Guo (Tommy) — chiropractic graduate and early-career clinical pathways

## Current MVP capabilities

- Editable profile, links, career goals, preferred cities, skills and projects
- Profile-aware sample job browser with filters and deterministic match estimates
- Company and clinic research with private profile-specific notes
- Job application board and list views with editable status, notes and history
- Postgraduate program comparison and document tracking for relevant profiles
- Editable monthly career roadmap
- Action-centre dashboard with current metrics, deadlines and planning progress
- Theme and default-profile preferences
- Versioned JSON export, validated import and reset controls
- Desktop sidebar and compact mobile navigation

## Sample-data disclaimer

Jobs, organisations and postgraduate programs are sample planning records for
local development. They are visibly labelled as sample data and must not be
treated as verified current vacancies, deadlines, fees or entry requirements.
Confirm all details with the relevant organisation before acting.

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on the development Mac.

## Same-Wi-Fi mobile testing

Start the server on all local interfaces:

```bash
npm run dev -- --hostname 0.0.0.0
```

Find the Mac’s active Wi-Fi address:

```bash
ipconfig getifaddr en0
```

On a phone connected to the same Wi-Fi, open
`http://<mac-local-ip>:3000`. The local IP is environment-specific and is not
stored in this repository.

## Available scripts

```bash
npm run dev       # development server
npm run build     # production build and TypeScript validation
npm run start     # serve the production build
npm run lint      # ESLint checks
npm run test      # deterministic domain and persistence tests
```

## Local data behaviour

CareerOS stores MVP data in browser `localStorage` under one versioned document.
Each profile has a separate workspace containing its edited profile, saved jobs,
applications, organisation notes, saved programs and roadmap. Switching profiles
never reuses another profile’s records.

Use **Settings → Export JSON** to create a local backup. Import validates the
storage version and profile ownership before replacing valid data. Malformed or
unsupported files are rejected.

To restore seed data, use:

- **Reset current profile** to reset only the active profile
- **Reset all local data** to reset both workspaces and preferences

Both reset actions require confirmation.

## Architecture

- `src/app` — App Router pages and route states
- `src/components` — feature and shared interface components
- `src/data` — typed sample jobs, organisations, programs and seed workspaces
- `src/lib` — matching, deadline aggregation and storage validation
- `src/providers` — profile-aware persisted application state
- `src/types` — shared CareerOS domain models

## Current limitations

- Data is local to one browser and is not encrypted or cloud-synchronised
- Sample opportunity and program data is not live or scraped
- Match estimates use transparent deterministic rules, not employer criteria
- No authentication, automatic application submission, payments or AI APIs
- The MVP does not yet support file uploads or shared accounts

## Planned phases

Supabase persistence and authentication remain planned after the local CRUD
workflows are validated. AI-assisted matching, CV support and interview
preparation remain later phases and are intentionally excluded from this MVP.
