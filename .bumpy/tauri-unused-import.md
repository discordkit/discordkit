---
---

Removes an unused `EVENT_SINK` import from `@discordkit/tauri`'s `client.ts`, left over from the original adapter build-out. The constant itself is unchanged and still used elsewhere in the package. This was the only `tsc --noEmit` error in the workspace. No consumer-visible behavior change, no public API change.
