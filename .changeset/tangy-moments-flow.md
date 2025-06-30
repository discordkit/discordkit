---
"@discordkit/client": major
"@discordkit/core": major
---

# June 2025 Sync

Wow, has it already been more than 3 years since the first commit? Time sure flies! A lot has changed in Discord's API in the past couple of yers, and this new major version seeks to get things synced up to present! There are a lot of breaking changes with this release, some of them organizational, others to the schemas themselves in terms of either shape or expected field values. But the design goal of this update was to model Discord's API as accurately as possible and help prevent submitting malformed data. To support this, a bunch of new data types have been added and the tests have been made even more robust! Hopefully from now on, updates will be more incremental and on a more frequent cadence. Here's a wall of text summarizing the changes:

## BREAKING CHANGES

### new `bitfield` datatype

Added a new `bitfield` custom schema for validating integer and string values of serialized bitfields. Discord uses this datatype to encapsulate flags for various things such as Permissions.

The best way to validate bitfields involves coercing the serialized values to `BigInt`s, and as such there needs to be a way to re-serialize these values back to their expected representation within a given schema. To do this, `asDigits()` and `asInteger()` were added as transformation actions.

This also involved added a means by which to mock this new datatype, which is powered by `enum` representations of the possible flags and their semantic meanings. Because of how delicate this ended up being, the entire set of mocking utilities needed to be overhauled and new tests were added to `@discordkit/core` to catch edge cases.

### add new `datauri` schema

Many of Discord's fields expect Data URI strings for images. A new `datauri` schema has been added to provide an extra layer of validation for these strings to guard against sending invalid data.

### updates to numerous schemas

The addition of `bitfield` schemas came as a result of syncing Discordkit's schemas with the latest Discord API specification. As such, expect that the type signatures of nearly every schema will be affected by these changes.

### schema reorganization

Discordkit's file and folder structure is designed to align closely with the organization of the official API docs. While most endpoints are grouped by their URL structure, there are some exceptions such as with Messages which have their own section separate from Channels (the URL path many of them belong to) and so for ease of maintenance these files have been relocated to reflect that.

Moving forward, additional things such as shared types may be moved into folders according to their location within the official documentation. This will apply to things such as Application Commands, Interactions, Message Components and Permissions / Roles.

---

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

---

## FIXES

### properly handle Sticker gif urls

Stickers have an exception for retrieving them in a gif file format, which uses a different base url than the standard Discord CDN
