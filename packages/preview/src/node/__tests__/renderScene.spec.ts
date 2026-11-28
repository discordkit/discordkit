import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vite-plus/test";
import { chromium, type Browser } from "playwright";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type * as NodeApi from "../index.js";

/**
 * The Node renderer draws with the CSS that `vp pack` compiles, so this spec drives the built package rather than the source the rest of the suite resolves to: the source has no compiled stylesheet, and under Vitest its CSS-module class names are placeholders that match nothing. That makes it a test of what consumers actually run. CI builds every package before testing; locally, run `vp run build` first.
 */
const entry = new URL(`../../../dist/node/index.mjs`, import.meta.url);

const scene: NodeApi.Scene = {
  width: 480,
  messages: [
    {
      payload: {
        components: [
          {
            type: ComponentType.Container,
            accentColor: 0x5865f2,
            components: [
              {
                type: ComponentType.TextDisplay,
                content: `Which hero is this?`
              }
            ]
          }
        ]
      }
    }
  ]
};

const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);

// Launching a browser is the slow part of this spec, and on a cold two-core CI runner it has taken longer than Vitest's default 10 second hook limit. The hooks that launch one get this much instead.
const launchTimeout = 60_000;

// Every test in this file draws through a real browser, and the first to run also pays for the first page and the fonts. On a slow CI runner single tests have run past Vitest's default 5 second limit, a different one each time, so the whole file gets a limit with room in it.
vi.setConfig({ testTimeout: 60_000 });

describe(`renderScene`, () => {
  let renderScene: typeof NodeApi.renderScene;
  let browser: Browser;

  beforeAll(async () => {
    if (!existsSync(entry)) {
      throw new Error(
        `The built Node API is missing at ${fileURLToPath(entry)}. This spec renders through the package's dist, because that is where the compiled stylesheet lives. Run \`vp run build\` (or \`vp pack\` in packages/preview), then run the tests again.`
      );
    }
    ({ renderScene } = (await import(entry.href)) as typeof NodeApi);
    // CI drives the Chrome its runner image ships, as the browser test project does; locally this is Playwright's Chromium.
    browser = await chromium.launch(
      process.env.CI ? { channel: `chrome` } : {}
    );
  }, launchTimeout);

  afterAll(async () => {
    await browser.close();
  });

  it(`returns a real PNG whose width is the chat column the scene asked for`, async () => {
    const { png, width, height } = await renderScene(scene, { browser });
    expect(png.subarray(0, 8)).toEqual(pngSignature);
    expect(width).toBe(480);
    // One line of text in a padded, bordered card on a padded column: taller than the text alone, far shorter than the viewport.
    expect(height).toBeGreaterThan(60);
    expect(height).toBeLessThan(200);
  });

  it(`scales the image by the requested device pixel ratio, so @2x output is sharp and not upscaled`, async () => {
    const single = await renderScene(scene, { browser });
    const double = await renderScene(scene, { browser, scale: 2 });
    expect(double.width).toBe(single.width * 2);
    expect(double.height).toBe(single.height * 2);
  });

  it(`renders the same scene to the same bytes, so an image diff only ever shows a real change`, async () => {
    const first = await renderScene(scene, { browser });
    const second = await renderScene(scene, { browser });
    expect(Buffer.compare(first.png, second.png)).toBe(0);
  });

  it(`refuses a component it cannot draw yet, instead of leaving it out and returning an image unlike the real message`, async () => {
    const withSeparator: NodeApi.Scene = {
      messages: [
        { payload: { components: [{ type: ComponentType.Separator }] } }
      ]
    };
    await expect(renderScene(withSeparator, { browser })).rejects.toThrow(
      /cannot draw a Separator component inside a message/
    );
  });

  it(`draws each theme differently, so the theme actually reaches the stylesheet`, async () => {
    const light = await renderScene({ ...scene, theme: `light` }, { browser });
    const onyx = await renderScene({ ...scene, theme: `onyx` }, { browser });
    expect(Buffer.compare(light.png, onyx.png)).not.toBe(0);
  });
});
