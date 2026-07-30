# Source health policy

CareerOS stores source name, HTTPS URL, source type, verification state, last successful review and next review date with every sourced record.

`src/data/source-health.ts` builds the review index. Local validation rejects malformed URLs, missing source names, missing review dates and archived opportunities marked open. Duplicate URLs are allowed when one official page directly supports several records; IDs remain unique.

Reviews are manual:

1. Open the exact official URL.
2. Confirm the page still supports the stored claim.
3. Update `lastVerified`, `lastUpdated` and `nextReviewDate`.
4. Archive ended cycles; never silently roll a historical record into a new intake.
5. Record unknown values as `null` or “Not published”.
6. Run `npm run validate:data` and `npm run verify:rc`.

Normal application runtime performs no crawling and makes no availability claim from a successful HTTP response alone.
