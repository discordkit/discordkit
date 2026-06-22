---
"@discordkit/native": minor
---

Added the `@discordkit/native/voice` subpath — the final core-coverage slice. Start/get/end voice calls in lobbies (`startCall`/`getCall`/`getCalls` are synchronous; `endCall`/`endCalls` async), surfaced as the package's second LIVE handle wrapper, `Call`: status, participants, self/local mute + deaf, per-participant volume, audio mode (VAD / push-to-talk), VAD threshold, and four per-call event streams (`onStatusChanged`, `onParticipantChanged`, `onSpeakingStatusChanged`, `onVoiceStateChanged`). Client-wide audio controls span all calls: input/output volume, mute/deaf-all, audio device enumeration + selection (`getInputDevices`/`setInputDevice`/…), and the device-change event (`onDeviceChange`). Adds the `awaitCallback` FFI bridge for SDK callbacks that carry no `ClientResult` (device enumeration, end-call).
