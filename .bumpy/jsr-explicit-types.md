---
"@discordkit/core": patch
"@discordkit/oauth": patch
---

Both packages now publish to JSR without `--allow-slow-types`, which means their pages carry generated type documentation and their scores rise from 64 to 94.

`@discordkit/core` gains a `RequestMethod` type — the union of HTTP methods this client actually sends (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) — replacing `string` on `request()` and `DiscordSession.queueRequest()`. Passing an unsupported method is now a type error rather than a runtime surprise.

`hasMimeType` and `hasSize` accept a custom `message` again through a generic parameter, so the literal still flows into the returned `CheckAction`.

No runtime behaviour changes.
