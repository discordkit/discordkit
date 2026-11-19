---
"@discordkit/client": minor
"@discordkit/gateway": patch
---

Brings the client up to date with Discord's API changes from August to November 2026.

**New endpoints**

- Computed permissions: `getGuildMemberPermissions`, `getGuildRolePermissions`, `getChannelMemberPermissions`, `getChannelRolePermissions`.
- Invite target users: `addTargetUser`, `removeTargetUser`, `bulkAddTargetUsers`, `bulkDeleteTargetUsers`. `createChannelInvite` also accepts `targetUserIds` and `roleIds`.
- Lobbies: `createOrJoinLobby`, `sendLobbyMessage`, `getLobbyMessages`, `createLobbyChannelInviteForSelf`, `createLobbyChannelInviteForUser`.
- The new Application Identity Profile resource behind Game Stats Widgets: `updateApplicationIdentityProfile`, `getApplicationIdentityProfile`, `getApplicationIdentitiesByUserId`, `getApplicationIdentitiesByExternalId`, `deleteApplicationIdentity`.

**Fixed: payloads that failed validation**

Flag fields reject any bit their enum does not name, so these gaps made real payloads unparseable:

- `AttachmentFlags` only had `IS_REMIX`. A message with a spoilered, animated or content-flagged attachment, a clip, or a media-channel thumbnail failed to parse. All eight documented flags are now present.
- `ChannelFlags` gains `CHANNEL_OBFUSCATED` and `IS_SPOILER_CHANNEL`. Discord now sends channels a bot cannot view over the Gateway with `CHANNEL_OBFUSCATED` set.
- An application role connection with no data stored parses: `platformName`, `platformUsername` and `metadata` are all optional, as documented.

**New fields**

- Content scanning: `Embed.flags` with the new `EmbedFlags` enum, `contentScanMetadata` on unfurled media items, and the `CONTAINS_*` attachment flags.
- `Embed.components` and the `components` embed type, for link previews built from components.
- Lobby members carry `additionalName`, on the response and on every endpoint that writes a member.
- Message create and edit requests take the documented attachment request shape, which adds `isSpoiler`. `editMessage` no longer demands full attachment objects where Discord only needs the `id` of each file to keep.
- `shard` on `getCurrentUserGuilds`, required for apps using large bot sharding.
- Audit log events `CHANNEL_POSITION_UPDATE` and `ROLE_POSITION_UPDATE`, and the `PRUNE_REQUIRES_ADMIN` guild feature.
- `modifyGuildChannelPositions` accepts an audit log reason.

**Type changes to check when upgrading**

- `ApplicationRoleConnection`'s three fields can now be `undefined`.
- Attachment arrays in request bodies are typed `AttachmentRequest[]` instead of `Partial<Attachment>[]`. The new type is a superset, so existing code compiles unchanged.

The gateway package's event docs now describe obfuscated channels and custom statuses hidden by a user's profile privacy setting. No gateway payload type changes.
