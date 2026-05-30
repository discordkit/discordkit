# Discord docs → discordkit refresh pipeline

A small toolchain for keeping `packages/client/src` aligned with the
official Discord developer documentation. The tools are **not run as
automation** — they're a manual-review playbook that gets us to ~80%
mechanical refresh, with the remaining 20% intentionally requiring a
human (or LLM-with-judgment) to triage.

This document describes:

1. The **pipeline** (which script feeds which).
2. The **workflow** (what order to run things in for a refresh).
3. The **edge cases and decisions** we hit along the way — why each
   tool's defaults are the way they are.
4. The **per-folder fudges** (FOLDER_PREFIX, FOLDER_INFIX, etc.) and
   when to extend them.
5. How to **add a new doc page** to the pipeline.

If you're picking this up cold to do a refresh: read § 2 (Workflow)
first, then § 3 (Edge cases) once you hit a warning you don't
understand.

---

## 1. Pipeline at a glance

```
        Discord docs (Mintlify)
                │
                │  fetch.ts        (mirror sitemap → .discord-docs/)
                ▼
        .discord-docs/**/*.md
                │
                │  parse.ts        (markdown → DocResource AST)
                ▼
        DocResource = { title, description, objects, enums, endpoints, … }
                │
        ┌───────┼───────────────────────────────────────────┐
        │       │                                           │
        ▼       ▼                                           ▼
   audit.ts   render-jsdoc.ts ─┐                  render-schema-jsdoc.ts ─┐
   (Markdown        │           │                          │              │
    reports)        │           ▼                          ▼              │
                    │     diff-jsdoc.ts            diff-schema-jsdoc.ts   │
                    │     (endpoint JSDoc)         (object/enum +         │
                    │                               field-level JSDoc)    │
                    └────────────┬──────────────────────────┘             │
                                 ▼                                        │
                       packages/client/src/                               │
                                 ▲                                        │
                                 │                                        │
                                 │   link-prose.ts                        │
                                 └── (auto-link prose mentions to         │
                                       {@link Name | display})            │
                                                                          │
   scaffold.ts (for brand-new endpoints) ◄──────────────────────────────┘
```

The two halves of the pipeline are mostly independent:

- **Read side** (`fetch` + `parse`) produces the `DocResource` AST
  shared by every downstream tool.
- **Write side** has three rewriters that target different regions
  of an existing `.ts` file:

  | Tool                   | Target                                        | Block-level | Field-level         |
  | ---------------------- | --------------------------------------------- | ----------- | ------------------- |
  | `diff-jsdoc.ts`        | Endpoint files (`<folder>/*.ts`)              | yes         | no                  |
  | `diff-schema-jsdoc.ts` | Schemas (types and endpoint body/params/form) | yes         | yes (careful merge) |
  | `link-prose.ts`        | All JSDoc, any folder                         | no          | wraps mentions      |

---

## 2. Workflow

### 2a. Add a brand-new endpoint or schema

When Discord adds something:

```bash
# 1. Pull fresh docs.
npx tsx scripts/docs/fetch.ts

# 2. See what's new vs the codebase.
npx tsx scripts/docs/audit.ts                     # everything
npx tsx scripts/docs/audit.ts <folder>            # one folder

# 3. Generate scaffolding for missing endpoints.
npx tsx scripts/docs/scaffold.ts <folder> <slug>
```

`scaffold.ts` outputs a `.ts` file based on the parsed doc endpoint.
**Always hand-review** before committing — schema field constraints,
return types, and cross-folder imports usually need polish.

### 2b. Refresh existing JSDoc against the current docs

The four-pass refresh we ran in May–June 2026 took the codebase from
"stale and inconsistent" to "in lockstep with Discord's docs." Run
the passes in this order for a future refresh:

#### Pass A: endpoint JSDoc

```bash
# Dry-run; review the diff.
npx tsx scripts/docs/diff-jsdoc.ts <folder>

# Apply.
npx tsx scripts/docs/diff-jsdoc.ts <folder> --write
vp check --fix packages/client/src/<folder>
vp test --run packages/client/src/<folder>
```

What it does: each exported fetcher's top-of-file JSDoc gets replaced
with a canonical block derived from the parsed doc endpoint
(heading link, METHOD + path, description, GFM admonitions, examples).

Hand-review checklist:

- **camelCase reversion**: docs use wire-format `snake_case`; we use
  camelCase. `withCounts` will revert to `with_counts` etc. Skim the
  diff and revert those by hand. This is the most common manual
  touch-up.
- **Cross-references**: the tool preserves any existing
  `{@link Name | display}` references on a best-effort basis — but
  when the docs description changed significantly, it may drop them.
  Re-apply any that mattered.
- **"Same as above" inlining**: some Discord endpoints describe
  themselves as "Same as above, except …" (e.g.
  `deleteWebhookWithToken`). The renderer faithfully reproduces this,
  which doesn't read well in a standalone JSDoc. Inline the parent
  endpoint's description by hand.
- **Mistitled blocks**: `matchEndpoint` will now WARN and skip if the
  existing JSDoc heading title matches one doc endpoint but the
  METHOD+path don't (caught a real bug where `getChannelPins.ts`
  carried a copy-pasted "Get Channel Messages" heading). When you
  see that warning, fix the heading by hand before re-running.

Commit per folder. Small commits make the manual-edit drift legible
in `git log`.

#### Pass B: schema JSDoc (block-level + field-level)

```bash
npx tsx scripts/docs/diff-schema-jsdoc.ts <folder>
npx tsx scripts/docs/diff-schema-jsdoc.ts <folder> --write
```

What it does:

- For each `export const xxxSchema = v.object(...)` and
  `export enum Xxx` it adds/refreshes a block JSDoc:
  `### [<Name>](<docUrl>#<anchor>)` + optional description.
- For each field inside a schema, runs a **careful-merge** against
  the matching doc field description. The merge rules (in
  `decideMerge()`):
  1. No existing comment → add the doc one.
  2. Existing is identical to docs (whitespace-tolerant) → skip.
  3. Existing carries `@deprecated`/`@see`/`@example`/`@remarks`/
     `@default`/`@param`/`@returns` → skip (hand-curated).
  4. Existing is a strict superset of docs (contains the doc text) →
     skip (we added context).
  5. Otherwise → WARN and keep ours (don't clobber).
- Also walks endpoint files (`<folder>/*.ts`) and refreshes
  field-level descriptions inside `body:` / `params:` / `form:`
  sub-objects from the corresponding `jsonParams` / `queryParams`
  / `formParams` doc tables.

Hand-review checklist:

- **WARN-flagged conflicts**: triage each. Often Discord's wording
  is more specific (added a max constraint, named a replacement
  field, etc.) — accept by editing manually. Sometimes ours is
  better — leave it.
- **Display-name acronyms**: the tool prefers the docs casing when
  it carries any 2+-uppercase acronym (`SKU` > `Sku`). If a new
  schema's docs heading has an acronym you want preserved, the
  rule will pick it up automatically.
- **"DM channel" linking**: the renderer faithfully reproduces what
  the docs say. Some Discord phrasing reads oddly when standalone
  (e.g. "Represents a guild or DM channel"). Touch up by hand.

#### Pass C: auto-link prose (cross-refs)

```bash
npx tsx scripts/docs/link-prose.ts <folder>
npx tsx scripts/docs/link-prose.ts <folder> --write
```

What it does: harvests the _existing_ `{@link Name | display}` corpus
across the codebase, then scans JSDoc prose for unlinked occurrences
of registered phrases and wraps them.

The registry is built from the codebase itself — we don't invent
phrase→type mappings. If a type isn't linked anywhere yet, it won't
be discovered. To register a new one, add a single `{@link}` in any
file by hand, then re-run.

Hand-review checklist:

- **Partial proper-noun linking**: linking "Application Command"
  inside the longer phrase "Application Command Interaction Metadata"
  is technically faithful but reads oddly. Decide case-by-case.
- **Possessive/event-name edge cases**: the tool protects "X Y Z
  Gateway event" sequences and bolded `**…**` spans. If a future
  edge case slips through (linking inside another protocol-name
  pattern), tighten the protected-regex in `link-prose.ts`.

#### Pass D: directive audit

This is **manual review** — no tool. Grep for:

```bash
grep -rEn "@deprecated|@see|@example|@remarks|Deprecated" packages/client/src --include="*.ts"
```

What to look for:

- Prose-style "**Deprecated in favor of `X`**" → convert to
  `@deprecated Use \`X\` instead. <reason>` so IDEs surface the
  strike-through.
- Bare `@deprecated` with no replacement guidance → add one
  (point at the replacement field or header).
- Duplicate examples: a `**Example Response**` markdown sub-section
  AND a redundant `@example` block. Drop the `@example`; the
  markdown form is canonical.
- Doc text that says "deprecated" but the schema has no `@deprecated`
  tag → add it.

---

## 3. Edge cases and design decisions (the "why")

This section is the institutional knowledge. When a future refresh
runs into an unexpected diff, look here first.

### 3.1 Soft-break collapse (parser)

Discord's MDX hard-wraps prose at ~80 columns. The mdast parser
returns those wraps as `\n` inside `text` nodes. Without
intervention, the output looks line-broken at the source's column
width, which is meaningless to readers.

**Decision**: `nodeToMarkdown()` in `parse.ts` collapses
`[ \t]*\n[ \t]*` to a single space for paragraph nodes. Admonition
content is normalized with `\s+` → ` ` so the body renders as one
logical line. JSDoc consumers wrap on display.

### 3.2 The "object" / "objects" suffix

Discord headings are inconsistent: "User Object" vs "Connection
Object" vs "Collectibles" (plural, no suffix). The codebase strips
all of these to bare `User`, `Connection`, `Collectible`.

**Decision**:

- `stripSuffixes()` in `render-schema-jsdoc.ts` drops trailing
  ` Object`/` Structure`/` Enum` from the rendered display name.
- `nameVariants()` in `diff-schema-jsdoc.ts` tolerates
  singular↔plural, " Type" / " Types" suffix variants, and
  "Meta"↔"Metadata" when matching doc headings.

### 3.3 Endpoint title mismatch — `matchEndpoint` hardening

`getChannelPins.ts` had a stale "Get Channel Messages" heading that
matched the docs' Get Channel Messages endpoint. If we'd trusted
the title alone, `--write` would have silently replaced the file's
JSDoc with content for the wrong endpoint.

**Decision**: `matchEndpoint()` now ALSO checks that METHOD + path
match (with `:param` wildcards on both sides). On mismatch it WARNs
and skips, so a human can fix the heading by hand before re-running.

### 3.4 Cross-ref display-text leakage

The `preserveCrossRefs()` step in `diff-jsdoc.ts` re-applies
`{@link X | display}` references after rewriting. An early version
used a negative-lookbehind/lookahead to avoid double-wrapping, but
that didn't protect URLs, paths, or code spans. Short display words
like "channel" leaked into URLs like `#start-thread-from-channel`,
paths like `/channels/:channel`, and code spans like `` `channel_id` ``.

**Decision**: split the rendered body into _protected_ segments
(markdown link URLs, inline code spans, existing `{@link …}` blocks,
the heading-link's URL) and _editable_ segments. Only substitute in
the editable segments.

**Second iteration**: an initial fix computed the segment split ONCE
and then ran every phrase against the editable segments. That broke
when an earlier phrase replacement turned plain text into a new
`{@link …}` block — a later short phrase would still see the old
"plain text" classification of the segment and substitute inside the
newly-created link, producing double-wrapped garbage like
`{@link Channel | {@link Channel | DM channel} object}`. The final
implementation in `replaceOutsideProtected()` recomputes the
protected ranges for each phrase iteration, so newly-introduced
`{@link …}` blocks are immediately shielded from the next pass.

### 3.5 Description-fallback rule for schemas

Many Discord object headings have NO prose description — just a
structure table. If the schema in the codebase had a hand-curated
explanation, naively replacing the block would clobber it.

**Decision**: `extractExistingBlockDescription()` extracts the
existing block's prose (preserving paragraph breaks, list items, and
GFM admonitions). The renderer then picks the description as:

1. existing if docs is empty
2. existing if it's a strict superset of docs (added paragraphs)
3. existing if it carries GFM admonitions (`> [!NOTE]` etc.) the
   docs description can't reconstruct
4. docs description otherwise

### 3.6 Field-level: when to rewrite, when to warn

Most fields already had good comments. The merge logic biases
HEAVILY toward preserving existing prose, only adding/replacing in
unambiguous cases.

**Decision**: see `decideMerge()` rules in §2 Pass B. The
`@directive` skip rule is critical — `@deprecated foo` should never
be rewritten just because the field description differs.

### 3.7 Paragraph and list preservation

Multi-paragraph blocks like `SKUFlags` (which has two paragraphs
plus a bulleted list) were getting collapsed to a single space-joined
run because `extractCommentText()` joined everything.

**Decision**: `extractExistingBlockDescription()` tracks a
three-mode state machine (`prose` | `list` | `quote`). Same-mode
lines join with appropriate separator (space for prose, newline for
list items and blockquote lines). The renderer emits each paragraph
with a blank-line separator and preserves intra-paragraph newlines.

### 3.8 Auto-link conservatism — multi-word only

A first cut of `link-prose.ts` linked single-word matches like
"guild" and "user" everywhere. Results were terrible — "all users"
became `all {@link User | users}`, "the guild's settings" became
`the {@link Guild | guild}'s settings`, etc. Possessive English
isn't a type reference.

**Decision**: `normalizePhrase()` rejects single-word phrases
unconditionally. Only multi-word phrases (with internal spaces) are
registered. We also block a hand-picked list of generic English
words (`level`, `flags`, `member`) even if they appear linked
somewhere — too noisy.

### 3.9 Gateway-event protection

Discord uses prose like "Fires a Thread Members Update Gateway
event" where "Thread Members" is part of a protocol identifier, not
a type reference. The linker would link "Thread Members" → `ThreadMember`,
breaking the event name.

**Decision**: `link-prose.ts` adds Gateway-event-name patterns to
the protected-regex. The pattern is permissive:
`(Title-Case-Word ){1,8}(lower-words ){0,4}(Title-Case-Word ){0,5}Gateway event(s)?`,
which catches both contiguous runs and ones with intervening
connectives ("Update and a Thread Create Gateway event").

### 3.10 Bolded sub-headings — also protected

`**Example Activity Instance**` is a markdown sub-heading. Linking
"Activity Instance" inside the bold span breaks the formatting.

**Decision**: added `\*\*[^*]+\*\*` to the protected-regex.

### 3.11 Existing `// URL` comments — replace, not absorb

Some old schemas had a top-of-file `// https://discord.com/...` URL
comment instead of a JSDoc block. The first version of
`diff-schema-jsdoc.ts` recognized the URL line as the "existing
block" and replaced it with the new JSDoc — good. But then the
`existingDescription` extraction RE-USED the URL line as the
description text, leaking the URL string into the new block.

**Decision**: `extractExistingBlockDescription()` early-returns ""
when the block is a single `// https://...` line. The new
JSDoc heading link supersedes the comment, and we don't smuggle it
back in as prose.

### 3.12 Acronym preservation in display names

`skuSchema` → derived display name "Sku" via PascalCase splitter.
But the docs heading is "SKU Object". The codebase consumers expect
to see "SKU".

**Decision**: `preferDocsDisplayName()` checks whether the docs
heading carries any 2+-uppercase run (`SKU`, `MFA`, `URL`). If so,
the docs casing wins. Otherwise the identifier-derived display
applies.

---

## 4. Per-folder fudges (FOLDER_PREFIX / FOLDER_INFIX / FOLDER_STRIP_IDENT)

Some folders need name-translation rules because the codebase
identifier doesn't match the docs heading verbatim. These live in
`diff-schema-jsdoc.ts`:

| Folder            | Knob                 | Value              | Why                                                                     |
| ----------------- | -------------------- | ------------------ | ----------------------------------------------------------------------- |
| `auto-moderation` | `FOLDER_PREFIX`      | `"Auto"`           | Codebase says `ModerationRule`, docs say "Auto Moderation Rule Object"  |
| `auto-moderation` | `FOLDER_STRIP_IDENT` | `["Moderation"]`   | `ModerationEvent` → strip "Moderation" → match "Event Types" enum       |
| `event`           | `FOLDER_PREFIX`      | `"Guild"`          | Codebase says `ScheduledEvent`, docs say "Guild Scheduled Event Object" |
| `stage`           | `FOLDER_PREFIX`      | `""` (intentional) | Stage's identifiers (`Stage`, `StagePrivacyLevel`) need infix instead   |
| `stage`           | `FOLDER_INFIX`       | `"Instance"`       | `Stage` → "Stage Instance" (matches docs heading)                       |
| `stage`           | `FOLDER_STRIP_IDENT` | `["Stage"]`        | `StagePrivacyLevel` → strip "Stage" → match bare "Privacy Level" enum   |

**When to add a new fudge**: if `diff-schema-jsdoc.ts` reports an
unmatched export and inspection shows the docs DO have the type
under a different name (e.g. "Application Command Permissions"
exists in docs but our identifier is `CommandPermissions`),
add the appropriate rule rather than hand-writing a one-off JSDoc.

**When NOT to**: if a type genuinely doesn't exist in docs as a
top-level entity (nested in a parent object's structure table, or
not documented), leave it unmatched and hand-write the block.
`ConnectionVisibility` (docs call this enum "Visibility Types" but
the codebase prefers a more-descriptive name) was handled this way.

---

## 5. Adding a new doc page

If Discord publishes a new resource:

1. `fetch.ts` will pick it up automatically (it follows the sitemap).
2. Map the folder name to the doc page(s) in:
   - `FOLDER_MAP` in `audit.ts`
   - `FOLDER_MAP` in `diff-jsdoc.ts`
   - `FOLDER_MAP` in `diff-schema-jsdoc.ts`

   Each tool's map is intentionally duplicated rather than imported,
   because the tools have different exclude lists. Drift between
   them is fine as long as the relevant folder is in the map you're
   actually running.

3. If the new folder needs name fudging (§ 4), add the entries.

4. Run the pipeline.

---

## 6. Decisions log — things you'll want to revisit

Choices we made that future maintainers may want to reconsider:

- **Block-level + field-level only**: we don't refresh JSDoc on
  exported `interface X extends v.InferOutput<typeof xSchema> {}`
  declarations. They don't carry their own descriptions; the schema
  block is the source of truth.

- **Snake-case → camelCase in doc descriptions**: applied to inline
  `` `code_spans` `` only. Plain prose is left alone. The
  `transformDocDescription()` function in `diff-schema-jsdoc.ts` is
  the single touch-point if you want to change this.

- **`/developers/...` markdown link flattening**: internal Discord
  doc links get flattened to their display text (e.g.
  `[Linked Channels](/developers/...)` → `Linked Channels`). The
  rationale is that those are docs-site cross-references, not
  references to types in our codebase — Pass 2b's
  `{@link}` linker is the canonical mechanism for in-codebase
  references. External `https://` links are preserved.

- **WARN-and-keep on field-level conflict**: when the existing
  comment differs meaningfully from the doc description, we keep
  ours. Bias: don't clobber hand-curated wording. If you want a
  refresh that prefers docs by default, flip the `decideMerge()`
  default to `replace`.

- **Single-word phrases never auto-link**: even if `Channel` is
  linked-by-itself somewhere in the corpus, the linker won't auto-
  link bare "channel" mentions. Too noisy; possessive English
  ("the channel's permissions") is too easy to mis-fire on. If you
  want single-word linking, change the early-return in
  `normalizePhrase()`.

- **No `@example` tags**: we use markdown sub-headings + fenced code
  blocks (`**Example Response**\n\`\`\`json …`) instead of `@example`.
Pass 2c removed a stray `@example`to enforce this. The reason:
TSDoc and the IDE hover-preview both render markdown
sub-sections, while`@example` rendering varies between IDEs.

---

## 7. The four-pass refresh log (May–June 2026)

For historical context: the four passes that produced the current
state of `packages/client/src`. Each row is a commit subject.

| Pass       | Commit               | Scope                                                                   |
| ---------- | -------------------- | ----------------------------------------------------------------------- |
| 2a-tooling | `21a5e87`            | parse soft-break fix                                                    |
| 2a-tooling | `9672ff8`            | cross-ref leak fix                                                      |
| 2a-tooling | `c2b3b3d`            | matchEndpoint hardening                                                 |
| 2a-folders | 24 commits           | All endpoint folders refreshed                                          |
| 2d-tooling | `e544be7`            | render-schema + diff-schema tools                                       |
| 2d-tooling | `9297ca4`, `a9f996b` | careful-merge, paragraph/list/admonition preservation, acronym handling |
| 2d-folders | 4 commits            | All schema folders refreshed                                            |
| 2b         | `60afc4e`            | link-prose, conservative multi-word matching                            |
| 2c         | `7f8d9aa`            | `@deprecated` audit                                                     |

Real Discord doc updates we picked up that aren't pure tooling work
(the high-value finds the refresh was for):

- `UserFlags.HYPESQUAD`: "Coordinator" → "Member"
- `UserFlags.CERTIFIED_MODERATOR`: → "Moderator Programs Alumni"
- `VoiceState.suppress`: meaning corrected ("muted by current user"
  → "permission to speak is denied")
- `Attachment.height/width`: applies to image **or video** now
- `AttachmentFlags.IS_REMIX`: marked deprecated
- `Integration.type`: new value `guild_subscription`
- `Guild.nsfwLevel` → "age-restriction level"
- `sticker/StickerType.GUILD`: dropped the "Boosted" qualifier
- `auto-moderation/ModerationActionType.BLOCK_MESSAGE`: gained
  custom-explanation context
- `channel/ChannelType.PUBLIC_THREAD`: now allowed under GUILD_FORUM
- components `Button/StringSelect.customId`: tightened to "1-100"
- Several slug corrections from `#…-channel` to `#…-message` after
  Discord reorganized message endpoints onto their own page

These are the kinds of finds you can expect from the next refresh —
small, semantically-significant changes scattered across a large
diff. The tooling exists to surface them.
