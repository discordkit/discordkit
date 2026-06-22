# @discordkit/core



## 4.0.1
<sub>2026-06-22</sub>

- [#60](https://github.com/discordkit/discordkit/pull/60)  *(patch)* Thanks [@Saeris](https://github.com/Saeris)!
  Dropped the `type-fest` dependency. `toCamelKeys`/`toSnakeKeys` now use local `CamelKeys`/`SnakeKeys` types instead of type-fest's `CamelCasedPropertiesDeep`/`SnakeCasedPropertiesDeep` — behaviorally identical for the underscore-delimited Discord API keys these convert, with one fewer runtime dependency.

## 4.0.0
<sub>2026-06-04</sub>

- [#50](https://github.com/discordkit/discordkit/pull/50)  *(major)* Thanks [@Saeris](https://github.com/Saeris)! - ## Drop pre-built `*Safe` / `*Procedure` / `*Query` exports
  Each `@discordkit/client` endpoint now exports only two symbols: the input `*Schema` and the raw Fetcher. The runtime-validated `*Safe` Proxy, the tRPC `*Procedure` builder, and the react-query `*Query` wrapper are no longer pre-wired per endpoint.
  ### Migration
  The helpers themselves still ship from `@discordkit/core` — call them yourself where you need them:
  ```ts
  // Before
  import {
    getGuildSafe,
    getGuildProcedure,
    getGuildQuery
  } from "@discordkit/client";
  // After
  import { toValidated, toProcedure, toQuery } from "@discordkit/core";
  import { getGuild, getGuildSchema } from "@discordkit/client";
  import { guildSchema } from "@discordkit/client";
  const getGuildSafe = toValidated(getGuild, getGuildSchema, guildSchema);
  const getGuildProcedure = toProcedure(
    `query`,
    getGuild,
    getGuildSchema,
    guildSchema
  );
  const getGuildQuery = toQuery(getGuild);
  ```
  The new pattern keeps the integration logic visible at the consumer site, removes ~600 dead exports from the published surface, and lets you customize the wrapping (different schemas, different procedure types, layered middleware) without forking the library.
  ### Also removed
  - The `procedures.ts` barrel files (per-subdir and root) and their `allProcedures` / `<group>Procedures` namespace re-exports.
  ### See also
  - `README.md` for the updated integration examples.
  - `examples/with-nextjs/src/app/api/trpc/[trpc]/trpc.ts` for a working tRPC router built on the new pattern.
- [#50](https://github.com/discordkit/discordkit/pull/50)  *(major)* Thanks [@Saeris](https://github.com/Saeris)! - ## Capability-aware `Fetcher<S, R, C>` and required per-call options
  Every endpoint Fetcher now carries a capability marker that determines which per-call options it accepts. The two capabilities introduced in v4:
  - `{ anonymous: true }` — endpoints whose Discord docs explicitly state "does not require authentication". Required at the call site; passing anything other than `true` is a type error.
  - `{ auditLogReason: true }` — endpoints whose Discord docs explicitly state "supports the `X-Audit-Log-Reason` header". The call accepts an optional `{ reason: string }`.
  The `Fetcher<S, R, C>` generic in `@discordkit/core` encodes these capabilities at the type level:
  ```ts
  type FetcherCapabilities = {
    anonymous?: boolean; // endpoint MUST skip Authorization
    auditLogReason?: boolean; // endpoint accepts X-Audit-Log-Reason
  };
  type Fetcher<S, R, C extends FetcherCapabilities = {}> = (
    input: S,
    options: RequestOptionsFor<C>
  ) => Promise<R>;
  ```
  ### What changed for consumers
  #### Anonymous endpoints (17 total)
  These endpoints REQUIRE `{ anonymous: true }` as the second argument:
  - **Webhook (9)**: `getWebhookWithToken`, `modifyWebhookWithToken`, `deleteWebhookWithToken`, `getWebhookMessage`, `editWebhookMessage`, `deleteWebhookMessage`, `executeWebhook`, `executeSlackCompatibleWebhook`, `executeGitHubCompatibleWebhook`
  - **Interaction tokens (8)**: `createInteractionResponse`, `getOriginalInteractionResponse`, `editOriginalInteractionResponse`, `deleteOriginalInteractionResponse`, `createFollowupMessage`, `getFollowupMessage`, `editFollowupMessage`, `deleteFollowupMessage`
  ```ts
  // Before (v3.x)
  await editWebhookMessage({ webhook, token, message, body });
  // After (v4)
  await editWebhookMessage(
    { webhook, token, message, body },
    { anonymous: true }
  );
  ```
  #### Audit-log-reason endpoints (54 total)
  These endpoints OPTIONALLY accept `{ reason: string }`:
  ```ts
  // Before (v3.x): no way to thread X-Audit-Log-Reason at the call site
  await modifyGuildRole({ guild, role, body: { name: "Mod" } });
  // After (v4)
  await modifyGuildRole(
    { guild, role, body: { name: "Mod" } },
    { reason: "Promoted alice to moderator" }
  );
  ```
  Affected folders: `auto-moderation`, `application-commands`, `channel`, `emoji`, `guild`, `guild-scheduled-event`, `invite`, `messages`, `permissions`, `sticker`, `template`, `webhook`.
  ### Why
  - The previous "second-argument boolean for anonymous, no support for audit-log reason" pattern was easy to forget and easy to misuse.
  - A type-level capability marker surfaces the requirement at the call site instead of failing silently at runtime when Discord rejects the request.
  - Wrappers like `toValidated`, `toProcedure`, and `toQuery` forward the capability through `Fetcher<S, R, C>` so the same guarantees hold post-composition.
  ### Migration
  For each call site, audit whether the endpoint is now capability-marked:
  - Anonymous endpoints — add `{ anonymous: true }` as the second arg. TypeScript will flag every site you missed.
  - Audit-log endpoints — no change required. Add `{ reason: "..." }` opportunistically wherever you've previously logged the cause-of-mutation elsewhere.
- [#50](https://github.com/discordkit/discordkit/pull/50)  *(major)* Thanks [@Saeris](https://github.com/Saeris)! - ## `multipart()` schema wrapper and `fileUpload` helper
  `@discordkit/core` adds two new exports for endpoints that send `multipart/form-data` bodies (file uploads, sticker creation, attachment-bearing messages):
  - `multipart(schema)` — wraps an object schema so the request layer serializes it as `FormData` instead of JSON. Files declared in the schema become parts; other fields become JSON-encoded form fields keyed as `payload_json` per Discord's REST conventions.
  - `fileUpload(opts)` — a Valibot schema for File/Blob inputs with optional MIME-type and byte-size constraints, used inside `multipart()` schemas.
  ```ts
  import { fileUpload } from "@discordkit/core/validations/fileUpload";
  const uploadSchema = multipart(
    v.object({
      avatar: fileUpload({
        mimeTypes: [`image/png`, `image/jpeg`],
        maxSize: 256_000
      }),
      nick: boundedString({ max: 32 })
    })
  );
  ```
  ### Endpoints migrated to `multipart()` in `@discordkit/client`
  Every endpoint that previously hand-rolled FormData now uses `multipart()` + `fileUpload` from `@discordkit/core`:
  - `createMessage`, `editMessage`, `executeWebhook`, `editWebhookMessage`, `editOriginalInteractionResponse`, `editFollowupMessage`, `createFollowupMessage`, `createInteractionResponse`
  - `createGuildSticker`, `modifyCurrentMember`, `modifyCurrentUser`, `modifyGuild`
  ### What changed for consumers
  - The schemas exported by these endpoints now describe their **inputs** uniformly — no more separate `*Multipart` types vs. JSON-body types. The same `parse` / `safeParse` call validates both file and field shapes.
  - `toValidated` automatically detects the multipart wrapper and validates uploads through the wrapped schema before the request goes out.
  ### Migration
  If you previously constructed `FormData` by hand and passed it to one of these endpoints, switch to the structured shape the schema expects:
  ```ts
  // Before
  const formData = new FormData();
  formData.append("file", file);
  formData.append("payload_json", JSON.stringify({ content: "look at this" }));
  await executeWebhook({ webhook, token, body: formData }, { anonymous: true });
  // After
  await executeWebhook(
    { webhook, token, body: { file, content: "look at this" } },
    { anonymous: true }
  );
  ```
  The request layer handles FormData construction internally.
- [#50](https://github.com/discordkit/discordkit/pull/50)  *(major)* Thanks [@Saeris](https://github.com/Saeris)! - ## "Pattern B" schema typing — `schema<T>`, `partialSchema`, `pickFields`/`omitFields`/`requiredFields`, `variantSchema`
  `@discordkit/core` adds six new helpers under `@discordkit/core/validations/schema` that change how `@discordkit/client` declares the types of its exported schemas. The goal: stop downstream `.d.ts` files from inlining the entire entries map of every schema they reference.
  ### Why this exists
  In v3.x, the type of every published schema was the full `v.ObjectSchema<{ id: v.GenericSchema<string>, ... }>` shape. Every consumer file that imported a schema re-inlined that entries map into its own emitted declarations. The result:
  - Dramatic duplication of nested object shapes in `.d.ts` output
  - Slow IDE hover (tsserver expands the full shape on every reference)
  - Occasional TS2502 / "type too complex" errors on deeply circular schemas (Channel, Message, Interaction)
  The fix: annotate the published type as `v.GenericSchema<T>` so downstream `.d.ts` references `T` by name instead of inlining it.
  ### What's new
  ```ts
  import {
    schema,
    partialSchema,
    pickFields,
    omitFields,
    requiredFields,
    variantSchema
  } from "@discordkit/core/validations/schema";
  const _userSchema = v.object({
    /* ... */
  });
  export interface User extends v.InferOutput<typeof _userSchema> {}
  export const userSchema = schema<User>(_userSchema);
  ```
  - `schema<T>(s)` — type-erases the runtime schema to `v.GenericSchema<T>`. Runtime unchanged.
  - `partialSchema<T>(s)`, `pickFields<T, K>(s, keys)`, `omitFields<T, K>(s, keys)`, `requiredFields<T, K>(s, keys)` — replacements for `v.partial` / `v.pick` / `v.omit` / `v.required` that accept type-erased `GenericSchema<T>` (which the raw Valibot functions reject because their constraint is `ObjectSchema<...>`).
  - `variantSchema<T>(key, schemas)` — replacement for `v.variant` that accepts erased variants. Preferred over `v.union` for discriminated unions because it dispatches in O(1) by the discriminator field.
  All six are annotated with `@__NO_SIDE_EFFECTS__` so tree-shakers can drop unused calls.
  ### Trade-offs
  After annotation, `v.partial(userSchema)`, `v.pick(userSchema, [...])`, and direct field-access patterns like `userSchema.entries.id` stop type-checking. Use the equivalent helpers above for the common cases.
  ### `@discordkit/client` sweep
  Every exported schema in `@discordkit/client` is now annotated through `schema<T>`. Discriminated unions (Component, ModerationAction, Channel, etc.) use `variantSchema` and dispatch on their discriminator field instead of trying each branch.
  ### Migration
  Most consumer code is unaffected — `getGuildSchema`, `guildSchema`, etc. still validate the same shapes at runtime. Only consumers that **manipulate the schema value** at the type level (e.g. via `v.partial`/`v.pick`/`schema.entries`) need the new helpers:
  ```ts
  // Before
  const patchSchema = v.partial(modifyGuildSchema);
  // After
  import { partialSchema } from "@discordkit/core/validations/schema";
  const patchSchema = partialSchema(modifyGuildSchema);
  ```
- [#50](https://github.com/discordkit/discordkit/pull/50)  *(major)* Thanks [@Saeris](https://github.com/Saeris)! - ## Toolchain migration + consumer bundle size
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

## 3.2.0

### Minor Changes

- [#47](https://github.com/discordkit/discordkit/pull/47) [`1a9de57`](https://github.com/discordkit/discordkit/commit/1a9de5746861831bfc0c24c5237b98d9ae45ca6c) Thanks [@Saeris](https://github.com/Saeris)! - Add request queue process with automatic rate limit throttling

## 3.1.0

### Minor Changes

- [`357ff21`](https://github.com/discordkit/discordkit/commit/357ff21d9a3d7a7a3f9ef1be920720f8e34fa096) Thanks [@Saeris](https://github.com/Saeris)! - ## Reduce generated types complexity with new core schemas

  This update is mainly internal refactoring. It introduces some new custom schemas to `@discordkit/core` that help to reduce overall type complexity in the generated types. This is accomplished by encapsulating common validation patterns into reusable schemas, which are then coerced to simple types which mask the complexity of their pipelines. As an end-user, this would make no difference in the runtime validation behavior, nor would it change the shape of the types you consume. However it does obfuscate the internal types of most schemas, which would make them a little more difficult to hook into and make modifications to.

## 3.0.2

### Patch Changes

- [#32](https://github.com/discordkit/discordkit/pull/32) [`c2574cd`](https://github.com/discordkit/discordkit/commit/c2574cd8c256d6122d17616e8ebf5eda608a62ac) Thanks [@Saeris](https://github.com/Saeris)! - ## Fix wildly complex type definitions

  Turns out, if you use `import * as v from "valibot";` _instead of_ destructured imports (as Discordkit did previously), you get _way simpler_ type definitions back from `tsc`. Before, for example, `Message` was over 7.5k lines long (at best, before hand optimization it widened to `any`). Now after this refactor... it's down to _800 lines_! That's almost a 10x reduction just for changing up how you import things. Wild.

  Could this have been solved by bundling instead? Maybe, who knows. Shipping Typescript be weird sometimes.

## 3.0.1

### Patch Changes

- [`01e8f20`](https://github.com/discordkit/discordkit/commit/01e8f2068a50a99db8f592694bf012a2a53a5fbf) Thanks [@Saeris](https://github.com/Saeris)! - Fix complex types generating as `any` during build

## 3.0.0

### Major Changes

- [#29](https://github.com/discordkit/discordkit/pull/29) [`e9d799a`](https://github.com/discordkit/discordkit/commit/e9d799a56d92031675c5db6102cdd35be3a1fe7a) Thanks [@Saeris](https://github.com/Saeris)! - # June 2025 Sync

  Wow, has it already been more than 3 years since the first commit? Time sure flies! A lot has changed in Discord's API in the past couple of yers, and this new major version seeks to get things synced up to present! There are a lot of breaking changes with this release, some of them organizational, others to the schemas themselves in terms of either shape or expected field values. But the design goal of this update was to model Discord's API as accurately as possible and help prevent submitting malformed data. To support this, a bunch of new data types have been added and the tests have been made even more robust! Hopefully from now on, updates will be more incremental and on a more frequent cadence. Here's a wall of text summarizing the changes:

  ## BREAKING CHANGES

  ### new `bitfield` datatype

  Added a new `bitfield` custom schema for validating integer and string values of serialized bitfields. Discord uses this datatype to encapsulate flags for various things such as Permissions.

  The best way to validate bitfields involves coercing the serialized values to `BigInt`s, and as such there needs to be a way to re-serialize these values back to their expected representation within a given schema. To do this, `asDigits()` and `asInteger()` were added as transformation actions.

  This also involved added a means by which to mock this new datatype, which is powered by `enum` representations of the possible flags and their semantic meanings. Because of how delicate this ended up being, the entire set of mocking utilities needed to be overhauled and new tests were added to `@discordkit/core` to catch edge cases.

  ### new `datauri` datatype

  Many of Discord's fields expect Data URI strings for images. A new `datauri` schema has been added to provide an extra layer of validation for these strings to guard against sending invalid data.

  ### updates to numerous schemas

  The addition of `bitfield` schemas came as a result of syncing Discordkit's schemas with the latest Discord API specification. As such, expect that the type signatures of nearly every schema will be affected by these changes.

  ### schema reorganization

  Discordkit's file and folder structure is designed to align closely with the organization of the official API docs. While most endpoints are grouped by their URL structure, there are some exceptions such as with Messages which have their own section separate from Channels (the URL path many of them belong to) and so for ease of maintenance these files have been relocated to reflect that.

  Moving forward, additional things such as shared types may be moved into folders according to their location within the official documentation. This will apply to things such as Application Commands, Interactions, Message Components and Permissions / Roles.

  ***

  ## FEATURES

  ### add new Voice endpoints

  added the following 4 endpoints under the voice category:
  - `getCurrentUserVoiceState`
  - `getUserVoiceState`
  - `modifyCurrentUserVoiceState`
  - `modifyUserVoiceState`

  ### add Poll schemas and endpoints

  This adds support for Polls and their associated endpoints:
  - `endPoll`
  - `getAnswerVoters`

  ### add SKU schemas and endpoint

  Added new schemas for SKU objects and a new endpoint to list SKUs
  - `listSKUs`

  ### add Lobby schemas and endpoints

  Includes for Lobby types and adds the following new endpoints:
  - `addMemberToLobby`
  - `createLobby`
  - `deleteLobby`
  - `getLobby`
  - `leaveLobby`
  - `linkChannelToLobby`
  - `modifyLobby`
  - `removeMemberFromLobby`
  - `unlinkChannelFromLobby`

  ### add Soundboard schemas and endpoints

  Added schemas for Soundboard data types and the following endpoints:
  - `createGuildSoundboardSound`
  - `deleteGuildSoundboardSound`
  - `getGuildSoundboardSound`
  - `listDefaultSoundboardSounds`
  - `listGuildSoundboardSounds`
  - `modifyGuildSoundboardSound`
  - `sendSoundboardSound`

  ### add Subscription schemas and endpoints

  Added schemas for Subscription data types and the following endpoints:
  - `getSKUSubscription`
  - `listSKUSubscriptions`

  ### add Snowflake date utilities

  Added two new utility functions: `snowflakeToDate()` and `dateToSnowflake()`, which can be used when working with Discord's `after` and `before` fields, which often expect ISO timestamps relative to a given object's snowflake ID.

  ### add Avatar Decoration image utility

  Added a new image URL utility to fetch Avatar Decorations

  ### added `hasMimeType()` and `toBlob` schema actions

  These Valibot schema actions aid with validating `datauri` strings to better ensure that fields are receiving well-formatted data from end-users.

  `hasMimeType()` behaves similarly to Valibot's built-in `mimeType()` validation action, which only operates on Blobs. Without native support for Data URIs, this is necessary to ensure proper encoding of images.

  `toBlob` is a transformation action that can transform a `datauri` to a Blob, which then can be used with any of Valibot's actions that operate on that data type, such as `maxSize()` to ensure that the provided value does not exceed a certain file size.

  ### add Component types

  Added schemas covering every Message Component type and updated the existing ones to match those in the API docs

  ### update Interaction data types and endpoints

  Interactions are now up to date with their specifications within the API docs

  ### add new `hasSize()` validation action

  Added a new `hasSize()` validation action which can be used with `datauri` schemas to validate approximately whether they are a given size or within a size range in terms of bytes

  ### update Audit Log schemas and endpoint

  Audit Logs have been reorganized and updated to reflect their current specification in the Discord API docs

  ### update Auto Moderation schemas and endpoints

  Reorganized to better reflect the organization of the API docs. All types and endpoints have been synced to their current specifications.

  ### add Application Emoji endpoints

  Applications have their own set of endpoints for Emojis and now they've been added!

  ### add support for Scheduled Event Recurrence Rules

  All of the types and endpoints for Scheduled Events have been updated to their latest specifications, including the addition of recurrence rules.

  ### update Guild schemas and endpoints

  Updated all Guild data types and endpoints to reflect the latest specifications. This added three new endpoints for Guilds:
  - `buildGuildBan`
  - `getGuildRole`
  - `modifyGuildIncidentActions`

  ### update Message schemas and endpoints

  Updated all Message data types and endpoints to reflect their latest specifications.

  ### update Stage, Sticker, and User schemas and endpoints

  Updates all of the data types and endpoints for Stickers, Stages, and Users to reflect their latest specifications.

  Adds a new endpoint for Stickers:
  - `getStickerPacks`

  ***

  ## FIXES

  ### properly handle Sticker gif urls

  Stickers have an exception for retrieving them in a gif file format, which uses a different base url than the standard Discord CDN

## 2.0.0

### Major Changes

- [#12](https://github.com/discordkit/discordkit/pull/12) [`5562b2b`](https://github.com/discordkit/discordkit/commit/5562b2b367776e4e70f40be2297b19bea4206991) Thanks [@Saeris](https://github.com/Saeris)! - Migrate schemas from `zod` to `valibot`

  This update represents a major refactor of both the core and client library codebases.

  Since Valibot has now become stable, Discordkit is migrating away from `zod` in favor of `valibot` as it's schema library because of it's significantly lighter weight when bundling. This choice was made because Discordkit is designed to be used in a variety of environments such as edge functions, serverless runtimes, and directly on clients, all of which are places where every byte saved counts towards better performance. From the beginning, Discordkit was designed to be functional in nature, so that you'll only bundle what you import and consume, which is the shared ethos of Valibot.

  Along with this change comes some significant refinements to every schema, so that it closer matches the behavior of Discord's API. Work on updating these schemas to match the v10 API one to one is ongoing, and as such some of the latest field updates may not yet be reflected in Discordkit. These will be patched in incrementally following this release.

## 1.1.0-next.0

### Minor Changes

- Replace `zod` with `valibot`

## 1.0.3

### Patch Changes

- [#9](https://github.com/discordkit/discordkit/pull/9) [`f973cc1`](https://github.com/discordkit/discordkit/commit/f973cc1b0b072d830d3e38fd291135bcd3f5c8c2) Thanks [@Saeris](https://github.com/Saeris)! - Added a new versioning script to workaround `@changeset/cli`'s inability to correctly run `yarn npm publish`, which accidentally leaves workspace protocol dependency versions unchanged and published to npm. Shoutout to https://github.com/PrairieLearn/PrairieLearn/pull/7533 for the fix.

## 1.0.2

### Patch Changes

- [#7](https://github.com/discordkit/discordkit/pull/7) [`2f4b55b`](https://github.com/discordkit/discordkit/commit/2f4b55b2d894e2295f8e6e2eb4fee9a97bbd0f6c) Thanks [@Saeris](https://github.com/Saeris)! - Actually fix missing build artifacts 😰

## 1.0.1

### Patch Changes

- [#5](https://github.com/discordkit/discordkit/pull/5) [`3be92aa`](https://github.com/discordkit/discordkit/commit/3be92aa51a2e533e05cdef5b8e1954307c3e1699) Thanks [@Saeris](https://github.com/Saeris)! - Add missing cjs build artifacts.

## 1.0.0

### Major Changes

- [#3](https://github.com/discordkit/discordkit/pull/3) [`e371616`](https://github.com/discordkit/discordkit/commit/e37161619e6ff02c0ac792c5727030f09207c22f) Thanks [@Saeris](https://github.com/Saeris)! - # v1.0.0

  This marks the first major release of Discordkit! 🥳

  Since the first few commits to Discordkit were made, this release includes out of the box support for [`tRPC``](https://trpc.io/) and [`react-query``](https://tanstack.com/query/latest) alongside isomorphic use in a JavaScript/TypeScript project with the bare request handlers.

  Basic integration tests were added for every included API endpoint and all endpoints have had their schemas and doc comments updated to the latest v10 API specification.

  Some initial usage documentation has been added and will be improved over the next several weeks. This will include some basic examples of usage alongside popular frameworks and libraries. Use cases are still being explored for this initial release, and so the immediate priority is ensuring that the supporting release infrastructure is in working order.

  At this time there is _no support for file uploads_. Additionally, reason headers also cannot yet be set. Support for these will be added shortly.
