// @ts-check
// Electron main process (ES module — Electron 42 supports ESM main, and our
// package.json is `"type": "module"`). NOT bundled by vite; only the renderer
// (src/) is. Authored in JS (Electron can't run .ts entries) with @ts-check +
// JSDoc so it still type-checks under `vp check`.
//
// Responsibilities: create the window, and wire the Discord Social SDK (running
// here in the main process) to IPC via @discordkit/electron so the renderer can
// drive it. The SDK never touches the renderer.

// Ordering-sensitive imports (MUST come first, in this order): `./env-cwd.mjs`
// chdirs to the example root, THEN `varlock/auto-load` loads `.env` from that
// cwd. This anchors `.env` resolution to the app dir (Varlock reads
// process.cwd(), but Electron can launch from any cwd — a packaged build or a
// Playwright `_electron.launch` won't cd here like `vp run start` does), and env
// must be populated before anything reads process.env. Static side-effect
// imports (evaluated in source order) — NOT top-level `await import(...)`, which
// would deadlock Playwright (see the NOTE near the bootstrap IIFE). The
// "absolute imports first" lint rule can't know this order is load-bearing, so
// it's disabled across the import block.
/* eslint-disable import/first -- relative cwd-setup import must precede the rest */
import "./env-cwd.mjs";
import "varlock/auto-load";

import { app, BrowserWindow, Menu, ipcMain } from "electron";
import { registerDiscord } from "@discordkit/electron/main";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
/* eslint-enable import/first */

const here = dirname(fileURLToPath(import.meta.url));
const exampleRoot = join(here, `..`);
const DEV_URL = process.env.ELECTRON_RENDERER_URL;

/**
 * Resolve the SDK path. A relative `DISCORD_SDK_PATH` is anchored at the example
 * ROOT (where package.json lives), not the launch cwd — so `electron .` from
 * here, the Playwright smoke, or a launch from the repo root all resolve the
 * same. Absolute paths pass through; unset returns undefined (let
 * @discordkit/native probe conventional locations).
 *
 * @returns {string | undefined}
 */
function resolveSdkPath() {
  const raw = process.env.DISCORD_SDK_PATH;
  if (!raw) return;
  return isAbsolute(raw) ? raw : join(exampleRoot, raw);
}
const sdkPath = resolveSdkPath();

/**
 * Forward renderer console output + errors to the main-process stdout, and log
 * main-process failures. Without this, runtime errors in the sandboxed renderer
 * (e.g. a rejected setActivity) are invisible from the terminal — you'd only see
 * them inside the app window. Makes the app observable during dev and CI smokes.
 *
 * @param {import("electron").BrowserWindow} window
 */
function wireTelemetry(window) {
  // Electron 42+: a single event object (the positional-args form is deprecated).
  window.webContents.on(
    `console-message`,
    /** @param {import("electron").WebContentsConsoleMessageEventParams} details */
    (details) => {
      console.log(
        `[renderer:${details.level}] ${details.message} ` +
          `(${details.sourceId}:${details.lineNumber})`
      );
    }
  );
  window.webContents.on(`render-process-gone`, (_event, details) => {
    console.error(`[renderer] process gone:`, details.reason);
  });
  window.webContents.on(`preload-error`, (_event, preloadPath, error) => {
    console.error(`[preload-error] ${preloadPath}:`, error);
  });
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1040,
    height: 820,
    // Size by content area (not incl. frame), and auto-hide the menu bar — this
    // demo has no use for File/Edit/View/Window.
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      // The sandboxed preload is bundled (electron/preload.ts -> .bundle.cjs)
      // by the `preload` pack task; sandboxed preloads can't import node_modules.
      preload: join(here, `preload.bundle.cjs`),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  });

  wireTelemetry(window);

  // Wire the bridge before loading the renderer so early events aren't missed.
  registerDiscord(ipcMain, {
    applicationId: process.env.DISCORD_APPLICATION_ID,
    libraryPath: sdkPath,
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
// Surface main-process crashes (otherwise silent on a GUI process).
process.on(`uncaughtException`, (error) => {
  console.error(`[main] uncaughtException:`, error);
});
process.on(`unhandledRejection`, (reason) => {
  console.error(`[main] unhandledRejection:`, reason);
});

void (async () => {
  try {
    await app.whenReady();
    // No application menu — keeps the demo chrome-free.
    Menu.setApplicationMenu(null);
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
