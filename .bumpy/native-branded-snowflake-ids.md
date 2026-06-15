---
"@discordkit/native": minor
---

Added branded **snowflake id types** (`UserId`, `LobbyId`, `ChannelId`, `MessageId`, `GuildId`, `ApplicationId` — all `Snowflake<Tag>`) so the compiler enforces that an id produced by one operation only flows into another expecting the same kind. They're plain `bigint` at runtime (the brand is a phantom field — zero cost, ids cross FFI/IPC/JSON unchanged). Ids returned by the SDK are branded at the read boundary, so they pass between operations with no casts; to brand a raw value you supply yourself, use the new `snowflake<T>(value)` helper. Applied across every snapshot interface, op signature, live-wrapper getter (`Lobby`/`Call`), and event callback. **Type-only change** — no runtime behavior change; surfaces wrong-id-kind bugs at compile time and self-documents which `bigint` is which.
