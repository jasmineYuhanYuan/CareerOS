# Sample data policy

Records are classified as Verified, User-created, Sample, Archived or Unknown.

- Verified records require provenance and review metadata.
- User-created records belong only to their profile workspace.
- Sample records carry a Sample label and are hidden from verified discovery by default.
- Archived records remain historical and never count as current.
- Unknown facts remain unknown.

Sample data must not create verified graph relationships, affect verified counts or readiness scores, or appear in verified search results. Demo mode is explicit and disabled by default. Release tests enforce these rules.
