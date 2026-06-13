// @ts-check
// Electron main process (ES module — Electron 42 supports ESM main, and our
// package.json is `"type": "module"`). NOT bundled by vite; only the renderer
// (src/) is. Authored in JS (Electron can't run .ts entries) with @ts-check +
// JSDoc so it still type-checks under `vp check`.
//
// Responsibilities: create the window, and wire the Discord Social SDK (running
// here in the main process) to IPC via @discordkit/electron so the renderer can
// drive it. The SDK never touches the renderer.

// Load + validate the example's `.env` into process.env via Varlock (matching
// the other examples). A desktop main is a plain Node runtime — no bundler
// injection — so we load Varlock here in code; this covers every launch path
// (manual `electron .`, the Playwright smoke, a packaged build). Must be the
// first import so env is populated before anything reads process.env.
import "varlock/auto-load";

import { app, BrowserWindow, ipcMain } from "electron";
import { registerDiscord } from "@discordkit/electron/main";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DEV_URL = process.env.ELECTRON_RENDERER_URL;

async function createWindow() {
  const window = new BrowserWindow({
    width: 720,
    height: 560,
    webPreferences: {
      // The sandboxed preload is bundled (electron/preload.ts -> .bundle.cjs)
      // by the `preload` pack task; sandboxed preloads can't import node_modules.
      preload: join(here, `preload.bundle.cjs`),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  });

  // Wire the bridge before loading the renderer so early events aren't missed.
  registerDiscord(ipcMain, {
    applicationId: process.env.DISCORD_APPLICATION_ID,
    libraryPath: process.env.DISCORD_SDK_PATH,
    targets: [window.webContents]
  });

  if (DEV_URL) {
    await window.loadURL(DEV_URL);
    window.webContents.openDevTools({ mode: `detach` });
  } else {
    await window.loadFile(join(here, `..`, `dist`, `index.html`));
  }
}

// NOTE: avoid module top-level `await` here. Electron's ESM main + Playwright's
// debugger attach deadlock when the main module suspends on a top-level await
// before the app bootstraps (`_electron.launch` then hangs). Awaiting INSIDE an
// IIFE is fine — it's the module-level suspension that's the problem.
void (async () => {
  try {
    await app.whenReady();
    await createWindow();
  } catch (error) {
    console.error(`Failed to create window:`, error);
    app.quit();
  }
})();

app.on(`window-all-closed`, () => {
  if (process.platform !== `darwin`) app.quit();
});

app.on(`activate`, () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow();
});
