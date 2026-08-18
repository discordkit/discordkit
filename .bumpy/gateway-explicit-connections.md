---
"@discordkit/gateway": major
---

The ambient connection is now a singleton instance, and configuration fails fast.

`configure()`, `connect()`, and `disconnect()` are removed. The package exports a `gateway` connection instead, mirroring `@discordkit/core`'s `discord` session:

```diff
-configure({ token, intents: [`GUILDS`] });
-connect();
+gateway.setIntents(`GUILDS`).connect();
```

Free functions hid where configuration went and offered nothing to inspect. An instance is discoverable, carries its own state, and reads the same as the REST client. Subscriptions still default to it, so the common case needs no wiring:

```ts
onMessageCreate((message) => console.log(message.content));
gateway.setIntents(onMessageCreate).connect();
```

Durable Objects must keep passing an explicit `{ connection }`, because module globals are per-isolate.

`token` and `intents` are now optional in `ConnectionConfig`, so a connection can be built empty and configured by `setToken()` / `setIntents()`. Both are validated in `connect()` rather than the constructor:

- No token, and no `DISCORD_BOT_TOKEN` in the environment, throws. The lookup is guarded, so it does nothing on runtimes without `process` — Cloudflare Workers reach the token through a binding and must pass it explicitly.
- No intents throws. An intentless IDENTIFY is legal but delivers almost nothing, which reads as a dead bot rather than a configuration mistake.

Both errors arrive before a socket opens, naming the fix, instead of surfacing later as an opaque `4004` close or as silence. `resolveToken()` and `TOKEN_ENV_VAR` are exported.
