// Electron preload — authored in TypeScript and BUNDLED to a self-contained
// `preload.bundle.cjs` (see the `preload` pack task) because the renderer is
// sandboxed: sandboxed preloads run as plain CJS with no Node/ESM module access,
// so every dependency (here, @discordkit/electron) must be inlined.
//
// Once bundled, exposing the bridge is synchronous — no import()-gating needed.

import { contextBridge, ipcRenderer } from "electron";
import { exposeDiscord } from "@discordkit/electron/preload";

exposeDiscord(contextBridge, ipcRenderer);
