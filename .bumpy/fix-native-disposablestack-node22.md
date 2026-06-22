---
"@discordkit/native": patch
---

Fixed `DisposableStack is not defined` on Node 22. The rich-presence builder uses `DisposableStack`, which is only a runtime global on Node 24+, but the package targets Node 22 (the oldest LTS). Install the spec-compliant `disposablestack` es-shim via a side-effect import so the global exists on Node 22 (no-op where it already does).
