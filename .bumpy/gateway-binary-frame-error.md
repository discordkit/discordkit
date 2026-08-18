---
"@discordkit/gateway": patch
---

A binary Gateway frame now raises an error instead of being dropped.

The connection asks for `encoding=json` with no compression, so every frame should be text. Anything binary means that assumption no longer holds — transport compression or ETF encoding, neither of which this client decodes. The message listener previously ignored those frames, so a bot would connect, receive nothing, and report no error: exactly the silent failure this package exists to make visible.

The error names both causes and the fix, rather than leaving a dead connection to diagnose.
