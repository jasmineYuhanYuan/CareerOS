# Career Knowledge Graph

Last verified: 29 July 2026

## Model

The graph uses stable entity IDs and typed entities for companies, jobs,
occupations, skills, certifications, universities, programmes, visas,
registration pathways, interview guides, online assessments, career roadmaps,
healthcare professions, locations and industries.

Each relationship records its source and target entity, relationship type,
strength from 0–100, rationale, evidence source IDs, verification status,
confidence, last-verified date and notes.

Relationship strength measures how directly the cited source supports the
connection. It is not a recommendation, match or quality score.

## Evidence hierarchy

CareerOS prioritises government, professional-body, university and employer
sources. Official requirements override community summaries. Community
evidence cannot establish a statutory, eligibility or compulsory requirement.
Every published edge must resolve to a source displayed by the explorer.

## Entity resolution

Resolution normalises case, punctuation and spacing and recognises curated
aliases. Initial aliases include:

- `CBA`, `CommBank` and `Commonwealth Bank`
- `AHPRA`, the full agency name and `Ahpra`
- `ACT`, `Canberra region`, `Australian Capital Territory` and `Canberra / ACT`

Aliases resolve to a canonical entity rather than creating duplicates.

## Validation

Automated validation rejects duplicate IDs, orphan relationships, unsupported
relationship types, missing evidence, strengths outside 0–100, connections to
archived entities and inappropriate two-way progression cycles.

## Personalisation boundary

The global graph contains verified career knowledge. Profile facts are kept in
the local CareerOS workspace and are evaluated by the gap-analysis engine.
Tommy-specific chiropractic entities are tagged for his planning context, but a
user-entered profile assertion is not presented as an official graph fact.

## Future API integration

The entity, relationship and source arrays are repository interfaces rather
than UI constants. A future database or API can implement the same contracts,
while validation remains at the ingestion boundary. No API, authentication or
external database is used in this local MVP.
