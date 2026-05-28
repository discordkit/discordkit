# Discord API Audit & Coverage Plan

> Living document. Update as the work progresses. The audit/refresh of `@discordkit/client` against the official Discord API docs is part of the v4 milestone.

## Goals

1. Bring `@discordkit/client` up to date with the current Discord HTTP API: add missing endpoints, update schemas where field shapes drifted, fix naming/path drift, and remove or deprecate endpoints Discord has retired.
2. Improve JSDoc coverage so an IDE tooltip on any export is enough — a consumer should rarely need to open the Discord docs website.
3. Build reusable tooling so the audit can be re-run cheaply when Discord ships further changes, and so a future docs-site + MCP server can consume the same structured data.

## Methodology

Two-pass approach:

- **Pass 1 — Code changes & additions.** Add missing endpoints, update schema field lists, rename/relocate misaligned files, fix obvious drift. Minimal doc-comment edits in this pass — just enough to make the new endpoint readable.
- **Pass 2 — Documentation pass.** Sweep across all endpoints and types to rewrite JSDoc using a canonical template driven by the parsed docs model. This is where we improve cross-references (`{@link ...}`), `@see` URLs, prose tightening, and any directive improvements.

Pass 2 is intentionally deferred so that the code shape settles first. Reviewing a doc-only diff is much easier when no behaviour is changing alongside it.

## Working branch

All v4 work — including this audit — continues on the `v4` branch. We bump to `4.0.0` (already drafted in `.bumpy/v4-drop-convenience-exports.md`) when the audit is also complete.

---

## Folder ↔ Discord docs URL mapping

| Repo folder                   | Discord docs page                                                | Notes                                        |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| `application`                 | `/developers/resources/application`                              | direct                                       |
| `application-commands`        | `/developers/interactions/application-commands`                  | types-only; endpoints live in `application/` |
| `application-role-connection` | `/developers/resources/application-role-connection-metadata`     | name truncated in repo                       |
| `audit-log`                   | `/developers/resources/audit-log`                                | direct                                       |
| `auto-moderation`             | `/developers/resources/auto-moderation`                          | direct                                       |
| `channel`                     | `/developers/resources/channel`                                  | direct                                       |
| `components`                  | `/developers/components/reference`                               | types-only                                   |
| `emoji`                       | `/developers/resources/emoji`                                    | direct                                       |
| `entitlements`                | `/developers/resources/entitlement`                              | plural in repo                               |
| `event`                       | `/developers/resources/guild-scheduled-event`                    | shortened                                    |
| `guild`                       | `/developers/resources/guild`                                    | direct                                       |
| `images`                      | `/developers/reference#image-formatting`                         | URL builders, not REST endpoints             |
| `interactions`                | `/developers/interactions/receiving-and-responding`              | callback endpoints + interaction types       |
| `invite`                      | `/developers/resources/invite`                                   | direct                                       |
| `lobby`                       | `/developers/resources/lobby`                                    | direct                                       |
| `messages`                    | `/developers/resources/message`                                  | plural in repo                               |
| `permissions`                 | `/developers/topics/permissions` (and bits of `resources/guild`) | role + permission types                      |
| `poll`                        | `/developers/resources/poll`                                     | direct                                       |
| `sku`                         | `/developers/resources/sku`                                      | direct                                       |
| `soundboard`                  | `/developers/resources/soundboard`                               | direct                                       |
| `stage`                       | `/developers/resources/stage-instance`                           | shortened                                    |
| `sticker`                     | `/developers/resources/sticker`                                  | direct                                       |
| `subscription`                | `/developers/resources/subscription`                             | direct                                       |
| `teams`                       | (needs confirmation — historically `topics/teams`)               | types-only; verify in current docs           |
| `template`                    | `/developers/resources/guild-template`                           | shortened                                    |
| `user`                        | `/developers/resources/user`                                     | direct                                       |
| `voice`                       | `/developers/resources/voice`                                    | direct                                       |
| `webhook`                     | `/developers/resources/webhook`                                  | direct                                       |

### Known exceptions / cross-folder relationships

1. **`images/`** — `reference#image-formatting` documents these as one large section, not per-endpoint tables. The auto-audit will not produce a clean per-file delta here; this folder needs manual review against the section.
2. **`permissions/`** — split across `topics/permissions` and `resources/guild` (role object). `Role.ts`, `RoleColors.ts`, `RoleFlags.ts`, `RoleTag.ts` are arguably guild-resource types. Decide during audit whether to relocate or keep current grouping.
3. **`teams/`** — types-only. Confirm whether the team object now lives inline under `resources/application` in the reorganized docs.
4. **`components/`** — types-only, lives under `components/reference`, not `resources/`.
5. **`application-commands/`** — types-only; the _endpoint_ files (`createGlobalApplicationCommand.ts`, etc.) live in `application/`. Intentional but worth flagging in audit reports.
6. **`interactions/`** — has both types and endpoints. Endpoints are the callback/response handlers (`createInteractionResponse`, `editOriginalInteractionResponse`, etc.).

---

## Docs format (Mintlify markdown export)

The Discord docs site is hosted on Mintlify. Appending `.md` to any page URL returns a clean markdown render — far more parseable than the rendered HTML. Examples:

- `https://docs.discord.com/developers/resources/user.md`
- `https://docs.discord.com/developers/reference.md`
- `https://docs.discord.com/developers/change-log.md`

A sitemap is available at `https://docs.discord.com/sitemap.xml` for URL discovery.

### Format conventions

- `## <Endpoint Name>` — endpoint header
  - Followed by `<Route method="VERB">/path</Route>`
  - Then descriptive prose, possibly `<Note>` / `<Warn>` blocks
  - Optional `###### JSON Params` / `###### Query String Params` / `###### Form Params` tables
- `### <Object Name>` — object header
  - Followed by `<ManualAnchor id="..." />`, then `###### <Object Name> Structure` table
  - Examples often appear under `###### Example <Name>` as `json` code blocks
- Enum-like tables under `###### <Enum Name>` — columns `Value | Name | Description` (or just `Value | Name`)
- Cross-references: `[label](/developers/path#anchor)`
- Type cell notation (Python-ish):
  - `snowflake`, `string`, `integer`, `boolean`, `array`, `array of <type>`, `object`
  - `?type` prefix = nullable (e.g., `?string`)
  - `field?` suffix in the field name column = optional
- Path placeholders use `[\{user.id}](/developers/resources/user#user-object)` syntax.

### Mapping to valibot

| Doc notation            | Valibot                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `field` (no suffix)     | required entry                                                   |
| `field?`                | `v.exactOptional(...)`                                           |
| `?type`                 | `v.nullable(...)`                                                |
| `field?` + `?type`      | `v.nullish(...)`                                                 |
| `snowflake`             | `snowflake` from `@discordkit/core`                              |
| `string`                | `v.string()` or `boundedString(...)` if length constraints noted |
| `integer`               | `v.pipe(v.number(), v.integer())` or `boundedInteger(...)`       |
| `array of <type>`       | `v.array(<typeSchema>)`                                          |
| `[name](url)` cross-ref | imported `<name>Schema`                                          |

### HTTP API changelog

`https://docs.discord.com/developers/change-log.md` lists every change tagged `["HTTP API"]`. Useful for triaging recent additions and identifying deprecations during the audit.

---

## Tooling

Three reusable scripts to build before the audit work. All under `scripts/docs/` and runnable with Node 26's `--experimental-strip-types`.

### T1. Docs fetcher — `scripts/docs/fetch.ts`

- Pulls every relevant `.md` page from `docs.discord.com` and caches them in `.discord-docs/` (gitignored).
- Drives from `sitemap.xml` filtered to: `resources/*`, `interactions/*`, `components/reference`, `events/*`, `reference`, `topics/*`, `change-log`.
- Records `lastmod` per page; supports `--force` to re-fetch all.
- Single command: `node --experimental-strip-types scripts/docs/fetch.ts`.

### T2. Docs parser — `scripts/docs/parse.ts`

Reads a cached `.md` file and emits a structured `DocResource`:

```ts
interface DocResource {
  title: string;
  description: string;
  objects: DocObject[];
  enums: DocEnum[];
  endpoints: DocEndpoint[];
}

interface DocObject {
  name: string;            // "User"
  anchor: string;          // "user-object"
  structureAnchor: string; // "user-object-user-structure"
  description: string;
  fields: DocField[];
}

interface DocField {
  name: string;            // already de-snake-cased ("global_name" -> "globalName")? Or kept raw? See decision below.
  rawName: string;         // "global_name"
  type: DocFieldType;
  description: string;
  optional: boolean;
  nullable: boolean;
}

interface DocFieldType {
  base: "snowflake" | "string" | "integer" | "boolean" | "array" | "object" | "ref" | ...;
  elementType?: DocFieldType; // for arrays
  refName?: string;           // for ref types, e.g. "User"
  refAnchor?: string;
}

interface DocEnum {
  name: string;
  rows: Array<{ value: string; name: string; description?: string }>;
}

interface DocEndpoint {
  name: string;            // "Get Current User"
  slug: string;            // "get-current-user"
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;            // "/users/@me" (placeholders normalized)
  rawPath: string;         // original Discord-format with [\{user.id}] etc
  description: string;
  notes: string[];
  jsonParams?: DocField[];
  queryParams?: DocField[];
  formParams?: DocField[];
  returns?: DocFieldType;  // inferred from description ("Returns a [user]...")
}
```

Parser is pure: no opinions about TypeScript or valibot output yet. The TypeScript/JSDoc rendering happens in a separate downstream consumer (T4).

**Decision pending:** Should `DocField.name` be already converted to camelCase or kept as raw? Probably keep raw + provide a helper — downstream code can decide.

### T3. Audit reporter — `scripts/docs/audit.ts`

Walks `packages/client/src/<folder>` and compares against the parsed `DocResource`. Writes one file per folder to `audit/<folder>.md` (gitignored). Each report includes:

- **Summary**: counts of ADD / REMOVE / RENAME / DRIFT findings.
- **Endpoints missing** (in docs, not in repo) → action: scaffold new file.
- **Endpoints orphan** (in repo, not in docs) → action: investigate (deprecated? renamed?).
- **Endpoints renamed** (best-effort: same path + method, different name).
- **Object field drift**: per object, fields added, removed, type-changed.
- **Suggested fixes**: file paths to touch, codemod hints where applicable.

The audit is the entry point to Pass 1 work for each folder.

---

## Pass 1 plan

For each folder, work the audit report top-to-bottom:

1. **ADD** — scaffold new endpoint files. Use the parser output + template renderer.
2. **DRIFT** — add new fields to existing object schemas. Match docs description verbatim in the JSDoc (Pass 2 will refine).
3. **RENAME** — rename file (`git mv`), update barrel `index.ts`, run codemod to update any consumers.
4. **ORPHAN** — investigate; either remove (if Discord deprecated) or document why we still ship it.
5. **TESTS** — for each added endpoint, scaffold a spec following the existing post-v4 pattern (`mockUtils.request.METHOD` + inline `toValidated`).

### Suggested folder order (by expected scope)

Rough triage; revise once audit reports are generated.

| Tier                                            | Resources                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Easy wins** (1–2 ADDs, minimal drift)         | `user`, `sticker`, `sku`, `subscription`, `voice`, `audit-log`, `invite`, `entitlements`, `application-role-connection`           |
| **Medium** (3–10 ADDs or some drift)            | `application`, `auto-moderation`, `emoji`, `event`, `interactions`, `poll`, `soundboard`, `stage`, `template`, `webhook`, `lobby` |
| **Hard** (significant ADDs or structural drift) | `guild`, `channel`, `messages`, `components`                                                                                      |
| **Special** (manual review only)                | `images`, `permissions`, `teams`                                                                                                  |

### Per-folder commit cadence

Commit per-folder so each diff stays reviewable. Suggested message format:

```
feat(<folder>): audit pass — <N> endpoints added, <M> fields updated
```

Drive-by fixes (e.g., the `componenetSchema` typo in `components/types/Component.ts`) get bundled with their folder's audit commit.

---

## Pass 2 plan

Once all folders are through Pass 1, do a documentation sweep.

### P2a — JSDoc renderer (`scripts/docs/render-jsdoc.ts`)

Given a `DocEndpoint` or `DocObject`, produce the canonical JSDoc block following the existing repo style:

```ts
/**
 * ### [<Title>](<doc URL>)
 *
 * **<METHOD>** `<path>`
 *
 * <description>
 *
 * > [!NOTE]
 * > <notes>
 */
```

For object fields:

```ts
/** <description from docs> */
```

### P2b — Cross-reference linker

Walk every JSDoc body and rewrite plain prose mentions of known type names into `{@link <Name> | <prose>}` references. Type registry comes from `T2` output.

### P2c — Directive review

- `@deprecated` for endpoints flagged in the changelog with deprecation notices.
- `@see` for canonical doc URL on each export.
- Examples in docs (the `Example User` blocks) become `@example` directives where appropriate.

Pass 2 is one or two large commits — easier to review when isolated from code changes.

---

## Decisions log

Track resolved questions here. (Add entries as we go; don't backfill from chat.)

| Date       | Decision                                                                                              | Reasoning                                      |
| ---------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 2026-05-27 | Doc cache lives at `.discord-docs/` (gitignored)                                                      | Lean repo; re-fetch on demand.                 |
| 2026-05-27 | Audit reports at `audit/*.md` (gitignored)                                                            | Local per-run output.                          |
| 2026-05-27 | Drive-by fixes (typos, etc.) bundled with their folder's audit commit                                 | Atomic per-folder progress.                    |
| 2026-05-27 | Build T1 first, validate parser on `user.md`, then T3                                                 | Cheap iteration on a known sample.             |
| 2026-05-27 | Pass 2 (JSDoc rewrite) deferred until all of Pass 1 is complete                                       | Settle code shape before doc polish.           |
| 2026-05-27 | Internal planning docs live at `docs/` root for now; can relocate once docs-site (Astro-based) exists | Docs site won't interfere with planning files. |

## Open questions

- `teams/` resource — where do team objects live in the current docs? Confirm during audit.
- Are there any endpoints in the repo that have been removed from Discord but we should keep for backwards compatibility during a deprecation window? Flag during audit.
- Pass 2 directive style — should we use `@see` blocks at all, given the title already links to the doc page? Decide after first sample.

---

## Status snapshot

(Update as work progresses.)

- [x] Inventory current `packages/client` coverage (28 folders, 211 endpoints, ~190 type files)
- [x] Establish folder ↔ doc URL mapping with exceptions flagged
- [x] Confirm Mintlify `.md` export is parseable and reliable
- [x] Write this spec
- [x] Build T1: docs fetcher — `scripts/docs/fetch.ts`
- [x] Validate parser assumptions on `user.md`
- [x] Build T2: docs parser (final) — `scripts/docs/parse.ts` (unified + remark-mdx, bottom-up classifier)
- [x] Build T3: audit reporter — `scripts/docs/audit.ts` (writes per-folder reports to `audit/`)
- [ ] Pass 1 — tier 1 (easy wins)
- [ ] Pass 1 — tier 2 (medium)
- [ ] Pass 1 — tier 3 (hard)
- [ ] Pass 1 — special folders (`images`, `permissions`, `teams`)
- [ ] Pass 2 — JSDoc rewrite

## Current audit snapshot

Run `node --experimental-strip-types scripts/docs/audit.ts` to refresh.

After the v4 audit-tooling refinements (mixed-case `PRESERVE_CASE` fix,
response-shape filtering, JSDoc-typo cleanup, types-only folder exclusion),
the genuinely-actionable findings are:

| Folder        |    ADD | REVIEW | RENAME | TYPES (noisy) |
| ------------- | -----: | -----: | -----: | ------------: |
| application   |      3 |      0 |      0 |             7 |
| channel       |      1 |      0 |      1 |             0 |
| guild         |      2 |      3 |      0 |             4 |
| invite        |      3 |      0 |      0 |             3 |
| lobby         |      2 |      0 |      2 |             2 |
| messages      |      4 |      0 |      0 |             9 |
| **TOTAL ADD** | **15** |  **3** |  **3** |             — |

Clean (no work needed): `application-role-connection`, `audit-log`,
`auto-moderation`, `components`, `emoji`, `entitlements` (done), `event`,
`interactions`, `poll`, `sku`, `soundboard`, `stage`, `sticker`,
`subscription`, `template` (done), `user` (done), `voice`, `webhook`.

Folders flagged for manual review (types-only or non-REST):
`application-commands`, `images`, `permissions`, `teams`.

### Known false-positive patterns in TYPES findings

The `TYPES` count is still noisy — the audit reports a type as missing when:

1. Repo uses a longer, more-specific name (e.g., `ConnectionVisibility.ts`
   vs the doc heading `Visibility Types`, or `StagePrivacyLevel.ts` vs the
   doc heading `Privacy Level`). The matcher doesn't handle prefix-based
   disambiguation.
2. Doc "objects" are actually documentation tables, not exportable types
   (e.g., `Audit Log Change Exceptions` in audit-log.md is a footnote
   table, not a type).
3. Doc objects with `Structure` in the heading (e.g.,
   `Radio Group Structure`) belong to a parent type that the audit
   doesn't roll them up under.

These are tractable but lower-priority improvements. Pass 1 work is
dominated by the 15 real ADD findings.

### Field-level drift (out of scope for this audit pass)

The T3 reporter does **not** yet detect field-level drift inside object
schemas. Known examples discovered manually:

- `user/types/User.ts` is missing `collectibles`, `primary_guild`, and
  `avatar_decoration_data` was changed from a string hash to an object.
- New types referenced by drifted fields aren't being created either.

A future pass should add field-level diffing to T3.
