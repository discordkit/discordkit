---
"@discordkit/client": major
---

## New Discord endpoints

`@discordkit/client` adds Fetchers and schemas for endpoints Discord has shipped since `v3.x`. Strictly additive — existing endpoint exports are unchanged.

### Application

- `editCurrentApplication` — PATCH `/applications/@me`
- `getApplicationActivityInstance` — GET `/applications/{application.id}/activity-instances/{instance.id}`

### Channel

- `setVoiceChannelStatus` — PUT `/channels/{channel.id}/voice-status`

### Guild

- `modifyCurrentUserNick` — PATCH `/guilds/{guild.id}/members/@me/nick`
- `getGuildRoleMemberCounts` — GET `/guilds/{guild.id}/roles/member-counts`

### Invite

- Target-Users endpoints (per the Discord docs Invite Target Users object)

### Lobby

- `bulkUpdateLobbyMembers` — PATCH `/lobbies/{lobby.id}/members`
- `updateLobbyMessageModerationMetadata` — PATCH `/lobbies/{lobby.id}/messages/{message.id}/moderation`

### Messages

- `searchGuildMessages` — GET `/guilds/{guild.id}/messages/search`

### Deprecated

- Several legacy guild endpoints that Discord removed from its public docs are now marked `@deprecated` and will be removed in a future major. They continue to make requests but no longer correspond to active Discord routes; consumers should migrate off them.
