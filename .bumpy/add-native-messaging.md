---
"@discordkit/native": minor
---

Added the `@discordkit/native/messaging` subpath: send messages to a user or a lobby (`sendUserMessage`, `sendLobbyMessage`, both with optional metadata, resolving with the new message id), edit/delete DMs (`editUserMessage`, `deleteUserMessage`), read messages as plain `Message`/`Channel` snapshots (`getMessage`, `getChannel`, `getUserMessages`, `getLobbyMessages`), list DM conversations (`getUserMessageSummaries`), and open a message in Discord (`openMessageInDiscord`, gated by `canOpenMessageInDiscord`). Message events (`onMessageCreated`/`onMessageUpdated`/`onMessageDeleted`) ride the same client-wide fan-out as lobby events. A `Message` surfaces unrenderable `additionalContent` (images/polls/threads) so games can show a "view on Discord" notice. Reuses the lobby slice's FFI primitives (Properties, UInt64Span, UInt64Out) — no new seam work.
