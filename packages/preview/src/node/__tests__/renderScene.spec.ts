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
  it
} from "vite-plus/test";
import { chromium, type Browser } from "playwright";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { fixtures } from "../../__tests__/fixtures.js";
import type * as Fonts from "../fonts.js";
import { loadAssets } from "../assets.js";
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
    // The default avatar and the ✅ emoji.
    expect(findings.map(({ code }) => code)).toStrictEqual([
      `asset-offline`,
      `asset-offline`
    ]);
    expect(findings.map(({ asset }) => asset)).toStrictEqual([
      `https://cdn.discordapp.com/embed/avatars/0.png`,
      `https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/2705.svg`
    ]);
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
    const withSeparator: NodeApi.Scene = {
      messages: [
        { payload: { components: [{ type: ComponentType.Separator }] } }
      ]
    };
    await expect(
      renderScene(withSeparator, { browser, cacheDir })
    ).rejects.toThrow(/cannot draw a Separator component inside a message/);
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

  describe.each(Object.entries(fixtures))(`the %s fixture`, (_, fixture) => {
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
  });
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
