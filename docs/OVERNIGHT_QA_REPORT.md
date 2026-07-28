# Overnight QA report

Browser-tested routes: Dashboard, Profiles, Jobs, Companies, Applications,
Study, Roadmap, Settings, Opportunities, Contacts and Documents.

Viewports: 375×812, 430×900, 1024×900 and 1440×900. All routes loaded without
visible alerts or horizontal document overflow. English and Chinese shell/
Dashboard states were tested; language persisted after refresh. Light/dark
tokens were production-built, while the captured browser session followed the
system dark preference.

Verified workflows include language switching, refresh persistence, Yuhan/Tommy
switching, saved-job profile isolation, opportunity-to-roadmap creation,
contact creation and document-record creation. Browser QA also confirmed the
More sheet and mobile bottom navigation.

Automated status at this checkpoint: 16 tests pass; lint, TypeScript production
build and curated-data validation pass. Dependency audit reports 12 high and
zero critical findings, documented separately.

Known limitations: legacy Chinese copy is incomplete; all bundled opportunities
remain sample data; browser storage is local to one browser; no authentication,
cloud sync, scraping, AI API, automatic submission or binary upload exists.

Local review URL: `http://localhost:3000`. Same-Wi-Fi URL must use the Mac's
current local IP and is intentionally not committed.
