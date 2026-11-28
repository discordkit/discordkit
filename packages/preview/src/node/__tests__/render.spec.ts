import { existsSync } from "node:fs";
import { copyFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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
import type * as NodeApi from "../index.js";

/**
 * `render` is what the CLI runs for each input: intake, lint and the renderer, reported as one list. These specs cover what that layer adds: one finding per problem with a path into the caller's input, a finding instead of a stack trace for a scene that cannot be drawn, the font options, and HTML output.
 *
 * Like `renderScene.spec.ts`, this drives the built package, since the renderer needs the compiled stylesheet; run `vp run build` first. Every render is offline against an empty cache, so nothing here reaches the network.
 */
const dist = new URL(`../../../dist/`, import.meta.url);
const entry = new URL(`node/index.mjs`, dist);

// Launching a browser is the slow part of this spec, and on a cold two-core CI runner it has taken longer than Vitest's default 10 second hook limit.
const launchTimeout = 60_000;

// Every test in this file draws through a real browser, and on a slow CI runner single tests in a file like it have run past Vitest's default 5 second limit, so the whole file gets a limit with room in it.
vi.setConfig({ testTimeout: 60_000 });

const require = createRequire(import.meta.url);
/** An open font that is not Noto Sans, standing in for gg sans, which cannot be in the repository. */
const standIn = join(
  dirname(require.resolve(`@fontsource-variable/noto-sans-jp/package.json`)),
  `files`,
  `noto-sans-jp-latin-wght-normal.woff2`
);
const picture = fileURLToPath(
  new URL(`../../__tests__/assets/square-128.png`, import.meta.url)
);

const text = (content: string): NodeApi.Scene => ({
  messages: [
    {
      payload: {
        flags: 32768,
        components: [
          {
            type: ComponentType.Container,
            components: [{ type: ComponentType.TextDisplay, content }]
          }
        ]
      }
    }
  ]
});

const latin = text(`Which hero is this? Answer within the minute.`);
const japanese = text(`## __兄は 先生です。__\n-# 兄 あに · 先生 せんせい`);

describe(`render`, () => {
  let api: typeof NodeApi;
  let browser: Browser;
  let cacheDir: string;

  beforeAll(async () => {
    if (!existsSync(entry)) {
      throw new Error(
        `The built Node API is missing at ${fileURLToPath(entry)}. This spec renders through the package's dist, because that is where the compiled stylesheet lives. Run \`vp run build\` (or \`vp pack\` in packages/preview), then run the tests again.`
      );
    }
    api = (await import(entry.href)) as typeof NodeApi;
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

  const draw = async (
    input: unknown,
    options: NodeApi.RenderInputOptions = {}
  ) => api.render(input, { browser, cacheDir, offline: true, ...options });

  describe(`findings`, () => {
    it(`reports a missing attachment once, from lint, where the caller's snake_case input names it`, async () => {
      const result = await draw(
        JSON.stringify({
          flags: 32768,
          components: [
            { type: 12, items: [{ media: { url: `attachment://card.png` } }] }
          ]
        })
      );
      expect(result.findings).toStrictEqual([
        expect.objectContaining({
          code: `attachment-missing`,
          severity: `warning`,
          path: [`components`, 0, `items`, 0, `media`, `url`],
          asset: `attachment://card.png`
        })
      ]);
      // The placeholder is drawn, so the image still shows where the picture would be.
      expect(result.image?.png.length).toBeGreaterThan(0);
    });

    it(`points an image the renderer could not load at the field that names it, in the caller's spelling`, async () => {
      const result = await draw({
        messages: [{ payload: latin.messages[0].payload, author: `1` }],
        context: {
          users: {
            "1": {
              name: `Inbou`,
              avatar: `https://cdn.example/inbou.png`,
              bot: true
            }
          }
        }
      });
      expect(result.findings).toStrictEqual([
        expect.objectContaining({
          code: `asset-offline`,
          severity: `warning`,
          path: [`context`, `users`, `1`, `avatar`],
          asset: `https://cdn.example/inbou.png`
        })
      ]);
      expect(result.valid).toBe(true);
    });

    it(`gives an emoji's image an empty path and names the image, since the emoji is text, not a field`, async () => {
      const result = await draw(text(`Correct ✅`));
      expect(result.findings).toStrictEqual([
        expect.objectContaining({
          code: `asset-offline`,
          path: [],
          asset: expect.stringMatching(/2705\.svg$/)
        })
      ]);
    });

    it(`returns no image and an error finding, not a thrown error, for a component the renderer cannot draw yet`, async () => {
      const result = await draw({
        flags: 32768,
        components: [
          {
            // A text input belongs in a modal, and the modal components are not drawn yet.
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                customId: `name`,
                style: 1,
                label: `Name`
              }
            ]
          }
        ]
      });
      expect(result.image).toBeUndefined();
      expect(result.valid).toBe(false);
      expect(result.findings).toContainEqual(
        expect.objectContaining({
          code: `component-unsupported`,
          severity: `error`,
          path: [`components`, 0, `components`, 0]
        })
      );
    });

    it(`still draws a message that Discord would refuse, since seeing the broken message is often the point`, async () => {
      const result = await draw({ content: `Draw me anyway`, components: [] });
      expect(result.valid).toBe(false);
      expect(result.findings).toContainEqual(
        expect.objectContaining({ code: `schema`, severity: `error` })
      );
      expect(result.image?.width).toBe(600);
    });

    it(`applies scene settings given as options over the input's own`, async () => {
      const result = await draw(
        { ...latin, width: 480 },
        { width: 320, theme: `light` }
      );
      expect(result.scene).toMatchObject({ width: 320, theme: `light` });
      expect(result.image?.width).toBe(320);
    });
  });

  describe(`gg sans`, () => {
    it(`draws Latin text with a supplied font file instead of Noto Sans, as the glyphs Chromium drew show`, async () => {
      const result = await draw(latin, { ggSans: standIn });
      const families = result.image?.fonts.used.map(({ family, system }) => ({
        family,
        system
      }));
      expect(families).toContainEqual({
        family: expect.stringMatching(/^Noto Sans JP/),
        system: false
      });
      expect(families).not.toContainEqual({
        family: `Noto Sans`,
        system: false
      });
      const plain = await draw(latin);
      expect(plain.image?.fonts.used.map(({ family }) => family)).toStrictEqual(
        [`Noto Sans`]
      );
      expect(
        Buffer.compare(
          plain.image?.png ?? Buffer.alloc(0),
          result.image?.png ?? Buffer.alloc(0)
        )
      ).not.toBe(0);
    });

    it(`reads every font file in a supplied directory and ignores the rest`, async () => {
      const directory = await mkdtemp(join(tmpdir(), `discordkit-preview-gg-`));
      try {
        await copyFile(standIn, join(directory, `0a1b2c3d.woff2`));
        await writeFile(join(directory, `LICENSE.txt`), `not a font`);
        const result = await draw(latin, { ggSans: directory });
        expect(result.image?.fonts.used).toStrictEqual([
          expect.objectContaining({
            family: expect.stringMatching(/^Noto Sans JP/),
            system: false
          })
        ]);
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    });

    it(`fails with what to do when the path is wrong, has no fonts, or holds two files for one face`, async () => {
      await expect(
        draw(latin, { ggSans: join(cacheDir, `missing.woff2`) })
      ).rejects.toThrow(/could not find the gg sans font at .*missing\.woff2/);
      await expect(draw(latin, { ggSans: cacheDir })).rejects.toThrow(
        /found no font files/
      );
      await copyFile(standIn, join(cacheDir, `a.woff2`));
      await copyFile(standIn, join(cacheDir, `b.woff2`));
      await expect(draw(latin, { ggSans: cacheDir })).rejects.toThrow(
        /two gg sans files for the same weight and style \(100 900 normal\): a\.woff2 and b\.woff2/
      );
    });
  });

  describe(`pinning CJK text`, () => {
    it(`pinned, draws Japanese text only with bundled fonts, so the image is the same on every machine`, async () => {
      const first = await draw(japanese, { cjk: `noto-sans-jp` });
      const again = await draw(japanese, { cjk: `noto-sans-jp` });
      expect(first.image?.fonts.machineDependent).toBe(false);
      expect(first.image?.fonts.note).toBeUndefined();
      expect(first.image?.fonts.used.every(({ system }) => !system)).toBe(true);
      expect(first.image?.fonts.used).toContainEqual(
        expect.objectContaining({
          family: expect.stringMatching(/^Noto Sans JP/)
        })
      );
      expect(
        Buffer.compare(
          first.image?.png ?? Buffer.alloc(0),
          again.image?.png ?? Buffer.alloc(0)
        )
      ).toBe(0);
    });

    it(`unpinned, says the image depends on this machine and how to pin it`, async () => {
      const result = await draw(japanese);
      expect(result.image?.fonts.machineDependent).toBe(true);
      expect(result.image?.fonts.note).toMatch(/--cjk noto-sans-jp/);
      // No bundled Japanese font was offered, so none drew it.
      expect(result.image?.fonts.used).not.toContainEqual(
        expect.objectContaining({
          family: expect.stringMatching(/^Noto Sans JP/),
          system: false
        })
      );
    });
  });

  describe(`html`, () => {
    const withPicture: NodeApi.Scene = {
      context: { attachments: { "card.png": { path: picture } } },
      messages: [
        {
          payload: {
            components: [
              {
                type: ComponentType.Container,
                components: [
                  {
                    type: ComponentType.TextDisplay,
                    content: `## __兄は 先生です。__ ||spoiler||`
                  },
                  {
                    type: ComponentType.MediaGallery,
                    items: [{ media: { url: `attachment://card.png` } }]
                  }
                ]
              }
            ]
          }
        }
      ]
    };

    it(`is one file that opens with no network and no scripts, and draws the same size as the PNG`, async () => {
      const result = await draw(withPicture, {
        html: true,
        cjk: `noto-sans-jp`
      });
      const html = result.image?.html ?? ``;
      expect(html).not.toMatch(/<script/i);
      expect(html).not.toMatch(/\.invalid/);
      expect(html).toMatch(/src="data:image\/png;base64,/);
      const page = await browser.newPage({
        viewport: { width: 600, height: 600 }
      });
      try {
        const requests: string[] = [];
        await page.route(`**/*`, async (route) => {
          const url = route.request().url();
          if (url === `https://file.test/`) {
            await route.fulfill({ contentType: `text/html`, body: html });
            return;
          }
          requests.push(url);
          await route.abort();
        });
        await page.goto(`https://file.test/`);
        await page.evaluate(async () => document.fonts.ready);
        expect(requests).toStrictEqual([]);
        const box = await page
          .locator(`[data-discordkit-preview-scene]`)
          .boundingBox();
        // The screenshot covers whole pixels, so a fractional layout height rounds up.
        expect(Math.ceil(box?.height ?? 0)).toBe(result.image?.height);
      } finally {
        await page.close();
      }
    });

    it(`inlines only the font files the text uses, to stay small`, async () => {
      const result = await draw(withPicture, {
        html: true,
        cjk: `noto-sans-jp`
      });
      const faces = result.image?.html?.match(/@font-face/g) ?? [];
      // Latin and a handful of the Japanese font's 124 slices, out of more than 150 faces declared to the renderer's page.
      expect(faces.length).toBeGreaterThan(1);
      expect(faces.length).toBeLessThan(12);
    });

    it(`is the same text every time for the same scene`, async () => {
      const first = await draw(withPicture, {
        html: true,
        cjk: `noto-sans-jp`
      });
      const again = await draw(withPicture, {
        html: true,
        cjk: `noto-sans-jp`
      });
      expect(first.image?.html).toBe(again.image?.html);
    });
  });
});
