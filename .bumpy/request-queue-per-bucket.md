---
"@discordkit/core": minor
"@discordkit/client": minor
---

Requests no longer wait in one line. Each rate limit bucket now has its own queue, so a slow or rate-limited route holds up only its own requests.

Before, every request went through one serial queue. A 429 retry slept while it held that queue, so every later request waited behind it. That included interaction replies, which Discord voids if they are not sent within 3 seconds. When a class pressed buttons at the same time, replies could miss that deadline, and users saw "This interaction failed".

Now:

- Requests to different routes are sent independently. So are requests on one route to different channels, guilds or webhooks, which Discord counts separately (its "major parameters").
- Requests on one route to one channel, guild or webhook still go one at a time, in the order they were made.
- A 429 holds up only its own queue. A global 429 holds every queue except interaction callbacks (`POST /interactions/{id}/{token}/callback`), which Discord does not count against the global limit. Interaction callbacks also no longer count toward, or wait on, the 50-requests-a-second limit.
- When a response says a bucket has no requests left, the next request on that bucket waits for the reset instead of sending into a 429. The session recorded these limits before, but looked them up under a different key, so it never waited. Routes that Discord limits together (the same `X-RateLimit-Bucket` hash) now wait on each other's count.

`getQueueSize()` now counts the requests not yet sent, across every queue. Requests to different routes can now finish in a different order from the one they were made in. If the order matters, await one before you start the next.

Failed requests now throw `DiscordAPIError`, a new export. It extends `Error` and has the HTTP `status`, plus Discord's JSON error `code` and `discordMessage` when the response body has them. Callers can now tell a missing permission (`50013`) from an expired interaction (`10062`) without parsing text. The message keeps its `Request to resource '…' failed:` prefix and now ends with the status, Discord's message and the code, for example `403 Forbidden: Missing Permissions (code 50013)`. Before, it ended with only the status text, which is empty over HTTP/2. `@discordkit/client` re-exports `DiscordAPIError`, so you can check `error instanceof DiscordAPIError` without a direct dependency on `@discordkit/core`.

Webhook and interaction tokens are now removed from the URL in the error message (`/interactions/{id}/<token>/callback`), and from the log line written when a request runs out of retries. Anyone who has one of these tokens can post as the bot.

Found while building [inbou](https://github.com/discordkit/inbou).
