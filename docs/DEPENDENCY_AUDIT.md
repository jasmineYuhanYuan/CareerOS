# Dependency audit — 29 July 2026

`npm audit` reports 12 high-severity findings and no critical findings. The
findings are transitive across the Next.js production tree (`postcss`, `sharp`)
and ESLint development tooling (`minimatch`, `brace-expansion` and related
packages). No direct application dependency was automatically changed.

The available automated remediation proposes breaking dependency changes.
`npm audit fix --force` was intentionally not used. Reassess supported Next.js
and ESLint releases before a public production launch; the local preview remains
subject to these unresolved upstream/transitive risks.
