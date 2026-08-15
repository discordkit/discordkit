---
"@discordkit/gateway": minor
---

Three improvements from an audit of the completed event surface:

- Dispatch payloads are camelized lazily, only for events that have a subscriber — measured ~79% cheaper at a realistic subscribe ratio. `connection.onDispatch` now delivers raw wire-shaped payloads.
- Each event module carries its own intents rather than looking them up, so importing one handler no longer drags in the 107-entry `EVENT_INTENTS` map: ~11 KB down to ~4 KB.
- `intents` accepts handlers as well as names, so `createConnection({ token, intents: [onMessageCreate] })` derives the mask from what the bot consumes.
