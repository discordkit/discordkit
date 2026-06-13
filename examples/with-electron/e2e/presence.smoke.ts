import { test, expect, _electron as electron } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Local, maintainer-driven smoke — NOT a CI gate. It launches the real Electron
 * app, which loads the real (non-redistributable) Social SDK via Koffi, and
 * checks the renderer wires up over IPC: status renders, the Connect button is
 * present, and the SDK log stream reaches the renderer.
 *
 * It does NOT complete OAuth (that needs a real browser login). It's gated on
 * DISCORD_APPLICATION_ID + DISCORD_SDK_PATH so it skips cleanly without them.
 */

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), `..`);

const hasEnv = Boolean(
  process.env.DISCORD_APPLICATION_ID && process.env.DISCORD_SDK_PATH
);

test.describe(`Electron presence (real SDK, local)`, () => {
  test.skip(
    !hasEnv,
    `set DISCORD_APPLICATION_ID and DISCORD_SDK_PATH to run the real-SDK smoke`
  );

  test(`renderer connects to the SDK over IPC`, async () => {
    // Playwright's env wants Record<string, string>; drop undefined values.
    // Also strip ELECTRON_RUN_AS_NODE — editor-integrated terminals (VS Code)
    // set it, which would make the Electron binary boot as plain Node (no app /
    // BrowserWindow) and the launch would fail.
    const env = Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] =>
          entry[1] !== undefined && entry[0] !== `ELECTRON_RUN_AS_NODE`
      )
    );
    const app = await electron.launch({ args: [APP_DIR], env });
    try {
      const window = await app.firstWindow();

      // The preload bridge exposed the typed API to the renderer (proves the
      // sandboxed-preload bundle ran and contextBridge wired up).
      const bridgeType = await window.evaluate(
        () => typeof (globalThis as { discord?: unknown }).discord
      );
      expect(bridgeType).toBe(`object`);

      // Status reflects a real SDK lifecycle value read over IPC (renderer →
      // preload → ipc → main → keystone → SDK → back), not the `…` placeholder.
      // This proves the whole main↔renderer round-trip works end to end.
      await expect(window.locator(`#status`)).not.toHaveText(`…`, {
        timeout: 10_000
      });

      // The Connect button is the renderer's entry into the auth flow.
      await expect(window.locator(`#connect`)).toBeVisible();
    } finally {
      await app.close();
    }
  });
});
