# Public preview deployment

CareerOS can be imported into Vercel from GitHub with framework preset
**Next.js**, build command `npm run build`, and no environment variables. The
build produces App Router pages; persistence remains browser-local and does not
sync between devices or users.

Before sharing a preview, run `npm run verify`, inspect both themes and both
languages, and confirm that sample opportunities remain visibly labelled.
Import/export should be tested in the production preview because it uses browser
file APIs.

No secrets are required. Never add private keys or local IP addresses to Vercel
or the repository. To roll back, redeploy the last known-good Git commit or use
Vercel's previous deployment promotion. Users should export a JSON backup before
clearing browser data or changing devices.

The preview has no authentication, encryption, cloud backup or account recovery.
