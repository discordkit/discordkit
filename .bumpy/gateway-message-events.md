---
"@discordkit/gateway": minor
---

Add the message, reaction, and poll dispatch events — `MESSAGE_DELETE`, `MESSAGE_DELETE_BULK`, the four `MESSAGE_REACTION_*` events, and both `MESSAGE_POLL_VOTE_*` events — bringing typed coverage to 40 of 84.

Unlike the alias events these have bespoke payloads, so each schema is hand-written from the docs' field tables and covered by specs that parse real payload shapes.
