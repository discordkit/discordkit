---
"@discordkit/native": patch
---

Extracted the koffi-free `toSubscription` / `Subscription` into their own `@discordkit/native/subscription` module (still re-exported from the root, so the public API is unchanged). This lets reactive/webview consumers — `subscribe` and the Electron/Tauri signal helpers — import them without dragging the FFI client (koffi, a native `.node` addon) into a browser bundle, which previously broke webview bundlers.
