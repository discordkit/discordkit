---
"@discordkit/native": minor
---

Added the `@discordkit/native/lobbies` subpath: create/join lobbies (`createOrJoinLobby`, with optional lobby + member metadata), fetch them (`getLobby`, `getLobbyIds`), and act on them through the package's first LIVE handle wrapper — the `Lobby` class — whose getters (`members`, `metadata`, `linkedChannel`) re-read the SDK on each access and whose methods cover `leave`/`linkChannel`/`unlinkChannel` plus per-lobby event subscriptions (`onMemberAdded`, …). Adds the client-wide lobby event fan-out (`onLobbyCreated`/`Deleted`/`Updated`/`MemberAdded`/`MemberRemoved`/`MemberUpdated`) and the channel-linking discovery surface (`getUserGuilds`, `getGuildChannels`). Also adds three reusable FFI seam primitives consumed by later slices: `readUInt64Span` (scalar id lists), `readProperties`/`encodeProperties` (the `Discord_Properties` string→string metadata map), and `allocUInt64Out`/`readUInt64Out` (bool-gated scalar out-params).
