# @discordkit/core

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
