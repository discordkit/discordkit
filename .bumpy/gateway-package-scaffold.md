---
"@discordkit/gateway": minor
---

Add `@discordkit/gateway`, a tree-shakeable Discord Gateway (WebSocket) client targeting the Cloudflare Workers / Durable Object runtime contract.

v0 covers the connection lifecycle — identify, heartbeat with jitter, resume, and reconnect backoff — plus dispatch subscription and the codegen'd opcode, close-code, and intent types. Typed per-event modules land next.
