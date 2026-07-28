# Opportunity data provenance

Every curated opportunity records its source name, source type, verification
status and sample status. Official-source records additionally require a source
URL and last-verified date. `npm run validate:data` rejects invalid categories,
statuses, dates, duplicate IDs, missing organisations and incomplete official
source metadata.

`Sample` means illustrative planning data, not a live vacancy or event.
`Unverified` must not be presented as current fact. `Official source` links to
the originating organisation and states when it was checked. `Expired` and
`Archived` records are excluded from normal discovery unless enabled. CareerOS
does not infer admissions, registration or employment eligibility.
