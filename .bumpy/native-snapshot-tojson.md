---
"@discordkit/native": minor
"@discordkit/tauri": patch
"@discordkit/electron": patch
---

The live `Lobby` and `Call` wrappers gain a `toJSON()` method (and exported `LobbySnapshot` / `CallSnapshot` types) that serializes the wrapper's live getters into a plain, transport-ready object — so `JSON.stringify(lobby)` works and any process/transport bridge can serialize a wrapper identically. The Tauri and Electron adapters now call `lobby.toJSON()` / `call.toJSON()` and import the snapshot types from native instead of hand-writing the serialization + re-declaring the types per adapter. Combined with snowflakes now being strings, the Tauri adapter drops its entire bigint apparatus: the `Wire<T>` type rewriting, the per-domain inbound id coercion, AND the `serialize`/`bigint.ts` helper are all gone — every payload is JSON-serializable as-is. A message's `sentTimestamp`/`editedTimestamp` are now `number` (epoch ms fit losslessly in a JS number) instead of `bigint`, so no payload carries a bigint and ids + timestamps cross the kkrpc bridge unchanged.
