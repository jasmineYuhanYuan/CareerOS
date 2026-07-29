# Gap Analysis Scoring

Last verified: 29 July 2026

## Deterministic scoring

CareerOS does not use AI to calculate readiness. Requirements have transparent
weights:

| Importance | Weight |
| --- | ---: |
| Required | 4 |
| Strongly preferred | 3 |
| Helpful | 2 |
| Informational | 1 |

Confirmed requirements receive full weight, unknown requirements receive half
weight, and missing or blocked requirements receive no weight. The displayed
score is rounded to a whole percentage.

## Eligibility caps

Hard requirements remain visible outside the average:

- a missing or blocked required item caps readiness at 45%;
- two or more unknown required items cap readiness at 64%;
- one unknown required item caps readiness at 79%.

An unknown is not a failure. It reduces confidence and may cap the planning
score until the user records the fact.

## Tommy

Tommy is analysed only from stored facts:

- Macquarie University;
- postgraduate chiropractic study;
- Canberra/ACT preference with Sydney/NSW secondary;
- chiropractic target roles.

Course completion, registration, work eligibility, English evidence, placement
details, techniques, patient experience, memberships and references remain
unknown unless Tommy records them. Qualification completion, Ahpra registration
and work eligibility therefore appear as required confirmations.

## Yuhan

Yuhan's stored Computer Science education, named skills and projects can count
as confirmed evidence. GPA, citizenship, work rights, graduation date,
internship history and unstored advanced skills remain unknown.

## Action plans

Actions are generated from non-confirmed requirements and grouped into
Immediate, Next 30 days, Next 3 months and Longer term. No due date is invented.
Users can add an action to their local roadmap and assign their own target date.

## Limitations

Readiness is a planning aid, not a hiring probability. Generic target pathways
currently use a conservative shared requirement set. Role-specific scoring
should only be expanded when a verified employer or regulator source defines
the requirement.
