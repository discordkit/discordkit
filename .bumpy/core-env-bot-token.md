---
"@discordkit/core": minor
---

The REST session now falls back to `DISCORD_BOT_TOKEN` from the environment.

```diff
-discord.setToken(`Bot ${process.env.DISCORD_BOT_TOKEN}`);
 await getCurrentUser();
```

`@discordkit/gateway` reads the same variable, and both clients take the same secret, so a bot needs no setup beyond `.env`. An explicit `setToken()` still wins, since a process may act as more than one identity, and a per-user bearer token is unaffected: only bot tokens come from the environment.

`.env` holds the raw token Discord issues. The `Bot ` prefix is added when building the header, so there is no second format to get wrong.

The lookup is guarded, so it does nothing on runtimes without `process` — bare Cloudflare Workers reach secrets through a binding and must call `setToken()`.

`tokenFromEnv()` and `TOKEN_ENV_VAR` are exported. The error raised when no token can be found now names both ways to supply one instead of reading `Auth Token must be set before requests can be made.`
