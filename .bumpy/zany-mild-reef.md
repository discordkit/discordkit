---
"@discordkit/native": minor
---

Added `statusDisplayType` to rich-presence activities (`ActivityInput`) — controls which field Discord surfaces in the user's text status: `name` (the app name, the default), `state`, or `details`. Maps the string key to `Discord_Activity_SetStatusDisplayType`; omit to leave the SDK default. Flows through the `@discordkit/electron` and `@discordkit/tauri` `setActivity` bridges unchanged.
