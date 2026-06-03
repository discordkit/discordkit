---
"@discordkit/core": major
"@discordkit/client": major
---

## Toolchain migration + consumer bundle size

Two changes that don't alter the public API but affect how `@discordkit/client` integrates into downstream projects.

### Tree-shaking

- Every `@discordkit/core` and `@discordkit/client` export is annotated with `@__NO_SIDE_EFFECTS__` on its enclosing function and `"sideEffects": false` in each package.json.
- The 614 client source files that previously imported from the `@discordkit/core` package barrel have been migrated to deep submodule paths — `from "@discordkit/core/validations/snowflake"` instead of `from "@discordkit/core"`. The published `dist/*.mjs` carry these deep imports too, so consumer bundlers see exactly which submodules are needed.
- Combined effect: consumer bundles only pay for what they actually import. A consumer that uses one endpoint no longer pulls in all 200+.

### Toolchain

The contributor toolchain switched from `ESLint + Prettier + Turbo + Changesets` to:

- **Vite+** (`vp`) — unified `vp check` (oxlint + oxfmt + tsc), `vp test` (vitest), `vp pack` (tsdown). A single `vite.config.ts` per workspace declares lint, format, test, and pack settings.
- **Bumpy** — per-PR `.bumpy/*.md` files instead of `.changeset/*.md`. Each PR adds one or more markdown files declaring the package bumps it triggers.
- **Per-package `tsconfig` removed** in favor of a single root `tsconfig.json`. The root adds `customConditions: ["development"]` so workspace imports resolve to `src/` during development without each package needing to build before its peers can typecheck.
- **Package exports gain a `development` condition** pointing at `src/`. Type-aware lint and `tsc` no longer require `dist/` to exist.

### CI

- New `.github/workflows/ci.yml` matrix tests against Node `22`, `lts`, and `latest`.
- New `.github/workflows/bumpy-check.yml` verifies every PR adds a bump file.
