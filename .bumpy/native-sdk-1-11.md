---
"@discordkit/native": minor
"@discordkit/electron": minor
"@discordkit/tauri": minor
---

Verified against Discord Social SDK 1.11.24259, and adds read-only access to the Discord desktop client's voice settings.

- native: `getVoiceSettings()` resolves with the user's mute/deafen state, input and output volume, voice mode, push-to-talk key and audio-processing toggles, and `onVoiceSettingsUpdated()` streams every change. These are the Discord client's settings, not those of a call made through the SDK. Exported from `@discordkit/native/voice`.
- electron, tauri: the same two operations on the `voice` namespace of the bridge.

**The minimum Social SDK is now 1.10.19337**, the release that introduced these symbols. On an older build the two new operations fail with a missing-symbol error, and so does the voice domain of the Electron and Tauri bridges. SDK 1.11 itself adds no public API: it is fixes and platform support.
