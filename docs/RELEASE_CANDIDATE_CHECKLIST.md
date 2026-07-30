# Release candidate checklist

Run:

```bash
npm run verify:rc
```

Expected gates:

- 59 unit/data tests pass;
- ESLint passes;
- TypeScript `--noEmit` passes;
- production build generates all routes;
- opportunity, intelligence, graph, sample-isolation, source-integrity and profile-isolation tests pass.

Manual review:

- switch between Yuhan and Tommy on dashboard, Action Centre and gap analysis;
- confirm no clinic content appears for Yuhan;
- confirm no technology application data appears for Tommy;
- inspect primary navigation at mobile, tablet and desktop widths;
- keyboard through grouped desktop navigation and mobile More sheet;
- check English and Simplified Chinese labels;
- verify archived/sample filters and official-source links;
- confirm application edits retain activity history.

Known release limitations are listed in `PRODUCT_AUDIT_SPRINT_9.md` and must not be described as implemented.
