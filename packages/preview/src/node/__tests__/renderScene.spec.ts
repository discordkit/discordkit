import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vite-plus/test";
import { chromium, type Browser } from "playwright";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { componentFixtures, fixtures } from "../../__tests__/fixtures.js";
import { resolveViewport } from "../../viewport.js";
import type * as Fonts from "../fonts.js";
import { loadAssets } from "../assets.js";
import { decodePng } from "../png.js";
import type * as NodeApi from "../index.js";

/**
 * The Node renderer draws with the CSS that `vp pack` compiles, so this spec drives the built package rather than the source the rest of the suite resolves to: the source has no compiled stylesheet, and under Vitest its CSS-module class names are placeholders that match nothing. That makes it a test of what consumers actually run. CI builds every package before testing; locally, run `vp run build` first.
 *
 * No render here reaches the network. Each one gets a fresh asset cache, filled where needed from a stubbed fetch that answers every image with the same small SVG.
 */
const dist = new URL(`../../../dist/`, import.meta.url);
const entry = new URL(`node/index.mjs`, dist);

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
                content: `Which hero is this? ✅`
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

const stubImage = async (): Promise<Response> =>
  Promise.resolve(
    new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><rect width="2" height="2" fill="#5865f2"/></svg>`,
      { headers: { "content-type": `image/svg+xml` } }
    )
  );

describe(`renderScene`, () => {
  let renderScene: typeof NodeApi.renderScene;
  let browser: Browser;
  let cacheDir: string;

  /** Fills the cache with every image `target` needs, found by asking an offline render what it is missing. */
  const warm = async (target: NodeApi.Scene): Promise<void> => {
    const { findings } = await renderScene(target, {
      browser,
      cacheDir,
      offline: true
    });
    await loadAssets(
      findings
        .filter(({ code }) => code === `asset-offline`)
        .map(({ asset }) => asset),
      { cacheDir, offline: false, attachments: undefined, fetch: stubImage }
    );
  };

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

  beforeEach(async () => {
    cacheDir = await mkdtemp(join(tmpdir(), `discordkit-preview-render-`));
    return async () => rm(cacheDir, { recursive: true, force: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  it(`returns a real PNG whose width is the chat column the scene asked for`, async () => {
    await warm(scene);
    const { png, width, height, findings } = await renderScene(scene, {
      browser,
      cacheDir
    });
    expect(png.subarray(0, 8)).toEqual(pngSignature);
    expect(width).toBe(480);
    // A message header and one line of text in a padded, bordered card: taller than the card alone, far shorter than the viewport.
    expect(height).toBeGreaterThan(80);
    expect(height).toBeLessThan(200);
    expect(findings).toStrictEqual([]);
  });

  it(`scales the image by the requested device pixel ratio, so @2x output is sharp and not upscaled`, async () => {
    await warm(scene);
    const single = await renderScene(scene, { browser, cacheDir });
    const double = await renderScene(scene, { browser, cacheDir, scale: 2 });
    expect(double.width).toBe(single.width * 2);
    expect(double.height).toBe(single.height * 2);
  });

  it(`renders the same scene to the same bytes, so an image diff only ever shows a real change`, async () => {
    await warm(scene);
    const first = await renderScene(scene, { browser, cacheDir });
    const second = await renderScene(scene, { browser, cacheDir });
    expect(Buffer.compare(first.png, second.png)).toBe(0);
  });

  it(`renders the same bytes offline from a warm cache as online, so a machine without network draws what one with it drew`, async () => {
    await warm(scene);
    const online = await renderScene(scene, { browser, cacheDir });
    const offline = await renderScene(scene, {
      browser,
      cacheDir,
      offline: true
    });
    expect(Buffer.compare(online.png, offline.png)).toBe(0);
    expect(offline.findings).toStrictEqual([]);
  });

  it(`draws placeholders for images it cannot load, and says which and why, instead of failing the render`, async () => {
    const { png, findings } = await renderScene(scene, {
      browser,
      cacheDir,
      offline: true
    });
    expect(png.subarray(0, 8)).toEqual(pngSignature);
    // Only the ✅ emoji: the author has no avatar, and the one drawn for them is local, so a bare payload needs nothing else.
    expect(findings.map(({ code }) => code)).toStrictEqual([`asset-offline`]);
    expect(findings.map(({ asset }) => asset)).toStrictEqual([
      `https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/2705.svg`
    ]);
  });

  it(`draws a timestamp chip 18px tall, as the desktop client draws one at 14px, because Noto Sans is given gg sans's ascent and descent`, async () => {
    const chipScene: NodeApi.Scene = {
      now: `2026-11-25T16:05:00Z`,
      messages: [
        {
          payload: {
            components: [
              {
                type: ComponentType.Container,
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: `ends <t:${String(Date.parse(`2026-11-25T16:05:45Z`) / 1000)}:R>`
                  }
                ]
              }
            ]
          }
        }
      ]
    };
    const { png } = await renderScene(chipScene, { browser, cacheDir });
    const bitmap = decodePng(png);
    // The chip is the normal modifier (#97979f at 16.1%) over the container's #242429: #36363c. Its height is the longest vertical run of that colour.
    const chip = [0x36, 0x36, 0x3c];
    let longest = 0;
    for (let x = 0; x < bitmap.width; x++) {
      let run = 0;
      for (let y = 0; y < bitmap.height; y++) {
        const at = (y * bitmap.width + x) * 4;
        const same = chip.every(
          (channel, index) => Math.abs(bitmap.data[at + index] - channel) <= 2
        );
        run = same ? run + 1 : 0;
        longest = Math.max(longest, run);
      }
    }
    expect(longest).toBe(18);
  });

  describe(`on an iPhone`, () => {
    const iphone = resolveViewport({ device: `iphone-14-pro` });
    /** A card holding only what captures of the iOS app show: text with a relative timestamp, in a container, from an app. */
    const observed: NodeApi.Scene = {
      now: `2026-11-25T16:05:00Z`,
      messages: [
        {
          payload: {
            components: [
              {
                type: ComponentType.Container,
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: `ends <t:${String(Date.parse(`2026-11-25T16:05:45Z`) / 1000)}:R>`
                  }
                ]
              }
            ]
          }
        }
      ]
    };
    const unobserved: NodeApi.Scene = {
      ...observed,
      messages: [
        {
          payload: {
            components: [
              {
                type: ComponentType.Container,
                components: [
                  { type: ComponentType.TextDisplay, content: `-# small print` }
                ]
              }
            ]
          }
        }
      ]
    };

    it(`draws a card made only of parts seen in the iOS app bare, with no caption, since there is nothing to warn about: the image is the phone's chat column`, async () => {
      const { width, placements } = await renderScene(observed, {
        browser,
        cacheDir,
        viewports: [iphone]
      });
      expect(width).toBe(393);
      expect(placements[0].drawing).toMatchObject({ x: 0, y: 0, width: 393 });
    });

    it(`captions a card holding a part nobody has seen in the app, and the caption names that part`, async () => {
      const { width, placements } = await renderScene(unobserved, {
        browser,
        cacheDir,
        viewports: [iphone],
        html: true
      }).then(async (result) => {
        expect(result.html).toMatch(/Not yet seen in the iOS app[^<]*subtext/);
        return result;
      });
      expect(width).toBe(393);
      // The caption sits above the drawing.
      expect(placements[0].drawing.y).toBeGreaterThan(0);
    });

    it(`draws the timestamp chip the full 20-point height of the line, as tome-019 shows (19.6 to 20 points), in the app's darker fill (#313137 on #242429)`, async () => {
      const { png } = await renderScene(observed, {
        browser,
        cacheDir,
        viewports: [iphone]
      });
      const bitmap = decodePng(png);
      // The subtle modifier (#97979f at 12.2%) over the container's #242429.
      const chip = [0x32, 0x32, 0x37];
      let longest = 0;
      // Inside the card's content (84 to 361 points), since its hairline border is the same grey.
      for (let x = 90; x < 355; x++) {
        let run = 0;
        for (let y = 0; y < bitmap.height; y++) {
          const at = (y * bitmap.width + x) * 4;
          const same = chip.every(
            (channel, index) => Math.abs(bitmap.data[at + index] - channel) <= 2
          );
          run = same ? run + 1 : 0;
          longest = Math.max(longest, run);
        }
      }
      expect(longest).toBe(20);
    });

    it(`frames the phone's whole screen with frame "screen": 393 by 852 points, with the messages ending 31 points above the message box, as at the end of a channel (tome-029)`, async () => {
      const { width, height, placements, html } = await renderScene(observed, {
        browser,
        cacheDir,
        viewports: [iphone],
        frame: `screen`,
        html: true
      });
      expect([width, height]).toStrictEqual([393, 852]);
      expect(placements[0].drawing).toStrictEqual({
        x: 0,
        y: 0,
        width: 393,
        height: 852
      });
      expect(placements[0].fitsOneScreen).toBe(true);
      // The status bar, channel header, message box and home indicator are plain labelled bands at their measured heights, which together with the chat make the screen.
      for (const label of [`status bar`, `channel header`, `message box`]) {
        expect(html).toContain(label);
      }
      const bitmap = decodePng(
        (
          await renderScene(observed, {
            browser,
            cacheDir,
            viewports: [iphone],
            frame: `screen`
          })
        ).png
      );
      // Scanning up the column at x = 200 from the message box (761 points down), the first pixel of the card's fill is 31 points up.
      const card = [0x24, 0x24, 0x29];
      let y = 760;
      const at = (row: number): number[] => {
        const offset = (row * bitmap.width + 200) * 4;
        return [...bitmap.data.subarray(offset, offset + 3)];
      };
      while (
        y > 0 &&
        !card.every((channel, index) => Math.abs(at(y)[index] - channel) <= 2)
      ) {
        y--;
      }
      // The card's bottom border sits between its fill and the space below it.
      expect(761 - (y + 1)).toBeGreaterThanOrEqual(31);
      expect(761 - (y + 1)).toBeLessThanOrEqual(32);
    });
  });

  it(`sizes a lone gallery picture from its own file when the payload does not give one, drawing it at the file's own size as the desktop client does`, async () => {
    const galleryOf = (file: string): NodeApi.Scene => ({
      context: {
        attachments: {
          [file]: {
            path: fileURLToPath(
              new URL(`../../__tests__/assets/${file}`, import.meta.url)
            )
          }
        }
      },
      messages: [
        {
          payload: {
            components: [
              {
                type: ComponentType.MediaGallery,
                items: [{ media: { url: `attachment://${file}` } }]
              }
            ]
          }
        }
      ]
    });
    const wide = await renderScene(galleryOf(`panorama-21x9.png`), {
      browser,
      cacheDir
    });
    const tall = await renderScene(galleryOf(`portrait-3x4.png`), {
      browser,
      cacheDir
    });
    expect(wide.findings).toStrictEqual([]);
    // Neither file is scaled: the 192×256 portrait is drawn 256px tall and the 336×144 panorama 144px tall. Before calibration both were scaled up, which the captures showed was wrong.
    expect(tall.height - wide.height).toBe(256 - 144);
  });

  it(`draws a placeholder where an image was missing, so the miss is visible in the image itself`, async () => {
    const missing = await renderScene(scene, {
      browser,
      cacheDir,
      offline: true
    });
    await warm(scene);
    const present = await renderScene(scene, { browser, cacheDir });
    expect(missing.height).toBe(present.height);
    expect(Buffer.compare(missing.png, present.png)).not.toBe(0);
  });

  it(`refuses a component it cannot draw yet, instead of leaving it out and returning an image unlike the real message`, async () => {
    // A label belongs in a modal, and the modal components are not drawn yet.
    const withLabel = {
      messages: [
        {
          payload: {
            flags: 32768,
            components: [{ type: ComponentType.Label, label: `Name` }]
          }
        }
      ]
    } as unknown as NodeApi.Scene;
    await expect(renderScene(withLabel, { browser, cacheDir })).rejects.toThrow(
      /cannot draw a Label component inside a message/
    );
  });

  it(`makes room in the image for an open select's list, which hangs below the card as the client's does`, async () => {
    const { inbouLevelPicker } = componentFixtures;
    const closed: NodeApi.Scene = {
      ...inbouLevelPicker,
      messages: inbouLevelPicker.messages.map((message) => ({
        ...message,
        openSelect: undefined
      }))
    };
    const open = await renderScene(inbouLevelPicker, { browser, cacheDir });
    const shut = await renderScene(closed, { browser, cacheDir });
    expect(open.findings).toStrictEqual([]);
    // Five options of two lines each, 8px below the control: far taller than the closed card alone.
    expect(open.height - shut.height).toBeGreaterThan(250);
  });

  it(`draws each theme differently, so the theme actually reaches the stylesheet`, async () => {
    await warm(scene);
    const light = await renderScene(
      { ...scene, theme: `light` },
      { browser, cacheDir }
    );
    const onyx = await renderScene(
      { ...scene, theme: `onyx` },
      { browser, cacheDir }
    );
    expect(Buffer.compare(light.png, onyx.png)).not.toBe(0);
  });

  it(`fails before rendering when the scene's clock cannot be read, naming the field`, async () => {
    await expect(
      renderScene({ ...scene, now: `noon` }, { browser, cacheDir })
    ).rejects.toThrow(/scene's `now`/);
  });

  describe.each(Object.entries({ ...fixtures, ...componentFixtures }))(
    `the %s fixture`,
    (_, fixture) => {
      it(`renders in all four themes, the same bytes every time, with nothing missing`, async () => {
        await warm(fixture);
        const themes = [`light`, `ash`, `dark`, `onyx`] as const;
        const renders = [];
        for (const theme of themes) {
          const first = await renderScene(
            { ...fixture, theme },
            { browser, cacheDir }
          );
          const again = await renderScene(
            { ...fixture, theme },
            { browser, cacheDir, offline: true }
          );
          expect(first.findings).toStrictEqual([]);
          expect(first.width).toBe(600);
          expect(Buffer.compare(first.png, again.png)).toBe(0);
          renders.push(first.png);
        }
        expect(new Set(renders.map((png) => png.toString(`base64`))).size).toBe(
          4
        );
        // Nine renders in one test; each is a few hundred milliseconds with the browser reused.
      }, 30_000);
    }
  );
});

describe(`the Node renderer's font stack`, () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch(
      process.env.CI ? { channel: `chrome` } : {}
    );
  }, launchTimeout);

  afterAll(async () => {
    await browser.close();
  });

  /** The stack a scene's text is drawn with, under the built stylesheet and the renderer's override. */
  const stackFor = async (lang: string): Promise<string> => {
    const css = await readFile(new URL(`styles.css`, dist), `utf8`);
    const { fontStackOverride } = (await import(
      new URL(`node/fonts.mjs`, dist).href
    )) as typeof Fonts;
    const rootClass = /\.([\w-]+_root)\s*\{/.exec(css)?.[1];
    const page = await browser.newPage();
    try {
      await page.setContent(
        `<style>${css}${fontStackOverride}</style><div data-discordkit-preview-scene lang="${lang}" class="${rootClass ?? ``}">x</div>`
      );
      return await page.evaluate(
        () =>
          getComputedStyle(
            document.querySelector(`[data-discordkit-preview-scene]`) ??
              document.body
          ).fontFamily
      );
    } finally {
      await page.close();
    }
  };

  it.each([`en-US`, `ja`, `ko`, `zh-CN`, `zh-TW`])(
    `starts at the bundled Noto Sans and never names gg sans for %s, so a machine with gg sans installed draws the same image`,
    async (lang) => {
      const stack = await stackFor(lang);
      expect(stack.startsWith(`"Noto Sans"`)).toBe(true);
      expect(stack).not.toMatch(/gg sans/);
    }
  );

  it(`puts Discord's Japanese system fonts right after it for a Japanese viewer, as Discord's own stack does`, async () => {
    await expect(stackFor(`ja`)).resolves.toMatch(
      /^"Noto Sans", "Hiragino Sans", .*Meiryo, Osaka, "MS PGothic", "Noto Sans"/
    );
  });
});
