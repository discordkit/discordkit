---
"@discordkit/electron": minor
---

Added @discordkit/electron: an Electron adapter that runs @discordkit/native (Discord Social SDK) in the main process and exposes it to the renderer over a typed, sandboxed contextBridge IPC bridge (registerDiscord / exposeDiscord / window.discord). Ships rich presence + auth wiring.
