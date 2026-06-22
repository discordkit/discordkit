---
"@discordkit/native": patch
---

Fixed FFI bindings that passed unregistered named handle/span types straight to koffi (e.g. `Discord_UserHandle *returnValue`), which threw "Unknown or invalid type name" at runtime when those calls were first made against the real SDK — `relationships.list()`, plus the lobbies, messaging, and voice handle/span reads. Only four value-structs are registered with koffi (`Discord_String`, `Discord_Handle`, `Discord_Span`, `Discord_Properties`); every other out-param now uses the registered generic — opaque handles read via getters use `void *returnValue`, spans use `Discord_Span *returnValue`. The JS-mock test backend doesn't run koffi's signature parser, so these only surfaced live.
