---
"@discordkit/gateway": minor
---

Add 27 typed dispatch events — every event Discord documents as a direct alias over a REST resource, bringing typed coverage to 32 of 84 receive events.

Each reuses the corresponding `@discordkit/client` schema rather than redefining it, and carries the intents that gate it. The remaining ~52 events have bespoke payloads that each need a hand-written schema.
