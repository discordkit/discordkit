---
"@discordkit/gateway": patch
---

Group the dispatch events by resource (`events/messages/`, `events/guild/`, `events/channel/`, …), mirroring how `@discordkit/client` organizes its endpoints. Every event keeps its existing export from the package root; the change also gives each event an importable subpath.
