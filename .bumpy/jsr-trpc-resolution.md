---
---

No release. `@trpc/server` moves into core's devDependencies so JSR can resolve it, which changes nothing about what npm consumers install.

The four packages that failed the previous release are still untagged at their current versions, so they retry as-is: npm skips them (already published) and only the JSR half runs.
