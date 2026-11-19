---
"@discordkit/gateway": patch
---

Close code `4007` (invalid seq) now discards the session. `closeAction(4007)` returned `{ reconnect: true, discardSession: false }`, so the client reconnected and sent `RESUME` with the same session id and sequence number Discord had just rejected.

Discord answers a rejected sequence by closing the socket rather than sending `INVALID_SESSION`, so nothing else cleared the session. Every reconnect repeated the same rejected `RESUME` instead of starting the new session Discord's docs call for.

`closeAction(4007)` now returns `{ reconnect: true, discardSession: true }`, and the next connection sends `IDENTIFY`. This is the path `4009` (session timed out) already took.
