# China Campus Recruiting

The China Campus Recruiting workspace is available at `/china-recruiting`. It reuses the active CareerOS profile workspace, persistence layer, badges, cards, dialogs, and dashboard patterns.

## Data integrity

- China opportunities are profile-specific and do not change Australian opportunity metrics.
- The initial target-company directory is tracking metadata only. It is not counted as active recruitment.
- CareerOS ships with no invented China vacancies, deadlines, or application links.
- Expired and archived records are excluded from daily recommendations and active metrics.
- Official, aggregator, community, and manual sources remain visibly distinct.
- Unknown deadlines remain `null` and display as "Deadline not published".

## Add a verified opportunity

Open **China Recruiting**, select **Import JSON**, paste one object or an array of objects, and choose **Import opportunities**. Required links must use HTTPS.

```json
{
  "company": "Verified company name",
  "position": "Verified position title",
  "category": "Software Engineering",
  "location": "Shanghai",
  "country": "China",
  "hiringSeason": "2027 秋招",
  "officialApplyLink": "https://official.example/jobs/verified-id",
  "sourceName": "Official Careers",
  "sourceUrl": "https://official.example/jobs/verified-id",
  "sourceType": "Official",
  "openDate": null,
  "deadline": null,
  "resumeVersion": "Chinese",
  "status": "To Apply",
  "priority": "P1",
  "fitScore": 85,
  "notes": "Verified against the official careers page."
}
```

Replace every placeholder with verified source data before importing. A record is de-duplicated by `company + position + officialApplyLink`. Re-importing the same record may refresh deadline and source metadata, but it preserves the user's application status unless **Force status updates** is explicitly enabled.

## Daily recommendation rules

The runtime recommendation score is separate from `fitScore`. It adds priority, deadline urgency, application readiness, and official-source verification signals. Applied, OA, interview, offer, rejected, withdrawn, archived, and expired records cannot enter **Today**.

## Validation

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run validate:data
```
