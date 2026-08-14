---
"@discordkit/native": patch
---

Refresh dependencies to their latest settled versions to shore up the toolchain foundations, and fix the CI E2E flake.

- Bump `varlock` (1.11 → 1.16) so CI stops resolving a drifted, stricter version than the lockfile — the source of the `with-nextjs-better-auth` E2E failure — and update `better-auth` (1.6.15 → 1.6.26) alongside.
- Re-dedupe Playwright after bumping `@playwright/test` to 1.62 (align `with-electron`'s direct `playwright` pin), so the shared runner stays a single instance.
- Refresh the rest of the catalog (React 19.2.8, Next 16.3, TypeScript-native-bridge bridge.12, koffi 3.1.4, jose 6.2.8, and other minor/patch updates).

Only `@discordkit/native`'s published dependency range changes (koffi); the rest is dev/example/CI tooling.
