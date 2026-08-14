---
"@discordkit/gateway": minor
---

Add typed dispatch events with per-event intent metadata: `onReady`, `onResumed`, `onGuildCreate`, `onMessageCreate`, and `onInteractionCreate`, each its own module and export so importing one never pulls in another.

Each subscriber carries the intents Discord requires for that event, and `intentsFor(...)` unions them, so a bot can request exactly what its handlers need — under-requesting fails silently, and over-requesting a privileged intent is a fatal 4014.

Dispatch payloads are now camelized at the transport boundary (as the REST layer already does), which is what lets the event schemas compose `@discordkit/client`'s rather than redefine them.
