---
"@discordkit/native": minor
"@discordkit/client": minor
---

Integrate the Social SDK 1.10 + Discord's July–Aug 2026 REST changelog.

- native: expose `Message.additionalName` — the optional game-provided author display name (e.g. a character name) added by the SDK's new `MessageHandle::AdditionalName()`. Flows through the electron/tauri message snapshots unchanged.
- client: `Channel.application_id` is now nullable (and modeled as a common channel field); `file_types` added to File Upload components and the `ATTACHMENT` command option; resolved channel objects in interactions gain `app_permissions`. Also fixed the application-command-option union so per-type fields (min/max, file types) are no longer stripped by the catch-all.
