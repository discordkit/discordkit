---
"@discordkit/core": none
"@discordkit/client": none
---

## Test suite performance overhaul

No runtime change for consumers. Notes for contributors and downstream maintainers running the test suite locally.

### `vitest` environment switched to `node`

The default `vitest` environment is now `node` instead of `happy-dom`. Across this codebase happy-dom was paying ~2.7s/file of environment-setup overhead × 267 test files, for nothing — Node 18+ already exposes the relevant web globals (`Response`, `URL`, `Blob`, `File`, `FormData`, `crypto.subtle`), and `verifyKey` feature-detects `typeof window`.

Wall-clock: **~26s → ~13.4s** for the full suite.

If a future test genuinely needs a DOM, opt in per-file with the directive:

```ts
// @vitest-environment happy-dom
```

### `valimock` bumped to 1.6.0

Picks up the eager-recursion fix for `v.nullable` / `v.nullish` / `v.optional` / `v.undefinedable` handlers. Per-mock cost on the heaviest schema (`messageSchema`, self-referencing via `referencedMessage`) restored to ~5.8ms after a ~26s/mock regression on 1.5.x.

### `MockUtils` response round-trip

`packages/test-utils` now round-trips the mocked `expected` value through `JSON.stringify` → `JSON.parse` before returning it to the spec. Without this, `toStrictEqual` flaked at ~1-in-14 full-suite runs whenever a response schema contained `exact_optional` fields: the in-memory mock retained `{ field: undefined }` entries that `JSON.stringify` drops from the response body, so the fetched-back object differed from `expected` even though they represented the same logical value.

A previous workaround (commit `77c56d8`) dropped `invalid:any()` assertions in two specific specs that were tripping this. The round-trip closes the bug class for every spec, current and future.
