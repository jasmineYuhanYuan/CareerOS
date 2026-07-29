# Knowledge Graph Coverage

Last verified: 29 July 2026

## Current graph

- 69 canonical entities
- 33 verified relationships
- 63 traceable source records

Relationship coverage:

| Relationship type | Count | Coverage |
| --- | ---: | --- |
| hires-for | 9 | Verified early-career programme records |
| regulated-by | 13 | 12 healthcare professions plus chiropractic registration administration |
| located-in | 8 | Canberra-area chiropractic employer-directory locations |
| requires-registration | 1 | Australian chiropractor pathway |
| interview-process | 1 | Xero early careers |
| uses-assessment | 1 | Xero HackerRank process |

The employer-directory location relationships do not imply that a clinic is
currently hiring. Archived SEEK records are excluded from the graph.

## Deliberately unsupported relationships

- Certifications are not connected to occupations unless the official source
  supports the precise occupational relationship.
- Visa records are not connected to jobs through generic assumptions.
- Company technology stacks are not inferred.
- Tommy's work rights, registration, course completion and clinical experience
  are not graph facts.
- Yuhan's GPA, citizenship, work rights, graduation date and internship history
  are not inferred.
- `progresses-to`, `relevant-visa`, `qualification-for` and similar types are
  modelled but remain empty until suitable official evidence is available.

## Interface coverage

The bilingual `/knowledge-graph` explorer provides entity search, entity,
relationship and verification filters, grouped connections, strengths,
rationales, source links and verification dates. `/intelligence` results link
to their graph entity.

The global chiropractic navigation item has been removed. Chiropractic
registration and Canberra clinic planning are shown only inside Tommy's career
roadmap. The legacy `/chiropractic` address redirects to `/roadmap`.
