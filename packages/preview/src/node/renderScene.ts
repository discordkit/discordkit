import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type * as Playwright from "playwright";
import type { Browser } from "playwright";
import type { Scene } from "../scene.js";
import { defaultWidth } from "../scene.js";
import { resolveClock } from "../format/timestamp.js";
import { placeholderClass, transparentPixel } from "../react/Image.js";
import { Scene as SceneView, sceneSelector } from "../react/Scene.js";
import type { AssetUrl } from "../react/SceneContext.js";
import {
  defaultCacheDir,
  loadAssets,
  type Finding,
  type LoadedAsset
} from "./assets.js";
import { fontFaces, fontOrigin, fontStackOverride, readFont } from "./fonts.js";

export interface RenderOptions {
  /** Device pixels per CSS pixel. Defaults to 1. */
  scale?: number;
  /** A browser to render in. Passing one skips the launch, which is most of a single render's cost; the caller closes it. Without one, a headless Chromium is launched for this render and closed after. */
  browser?: Browser;
  /** Where fetched images (avatars, emoji) are cached between renders. Defaults to `node_modules/.cache/@discordkit/preview/assets` under the working directory. Delete it to fetch everything afresh. */
  cacheDir?: string;
  /** Draw only images that are already cached: a cache miss becomes a placeholder and a finding instead of a fetch. Defaults to false. */
  offline?: boolean;
}

export interface RenderResult {
  png: Buffer;
  /** Width of the image in device pixels: the scene width times `scale`. */
  width: number;
  /** Height of the image in device pixels. */
  height: number;
  /** What the caller should know about the render, such as an image drawn as a placeholder. Empty when everything was drawn as asked. */
  findings: Finding[];
}

export type { Finding, FindingCode } from "./assets.js";

/** The compiled stylesheet `vp pack` writes beside this module's directory: `dist/styles.css`. */
const stylesheetUrl = new URL(`../styles.css`, import.meta.url);

const pageOrigin = `https://scene.discordkit-preview.invalid`;

/** Where the page asks for the images the renderer loaded. Answered from memory, like the fonts. */
const assetOrigin = `https://assets.discordkit-preview.invalid`;

/** Pins anything that could differ between two renders of the same scene. */
const determinism = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html,body{margin:0}`;

const loadStylesheet = async (): Promise<string> => {
  try {
    return await readFile(stylesheetUrl, `utf8`);
  } catch (error) {
    throw new Error(
      `@discordkit/preview could not read its stylesheet at ${fileURLToPath(stylesheetUrl)}. The Node renderer draws with the CSS that \`vp pack\` compiles into the package's dist folder, and that file is missing, which happens when this module is loaded from source instead of from a build. Build the package (\`vp run build\` in packages/preview) and import the built \`@discordkit/preview/node\`.`,
      { cause: error }
    );
  }
};

const launchChromium = async (): Promise<Browser> => {
  let playwright: typeof Playwright;
  try {
    playwright = await import(`playwright`);
  } catch (error) {
    throw new Error(
      `@discordkit/preview/node could not load \`playwright\`, which it uses to drive headless Chromium. It is an optional peer dependency, so installing @discordkit/preview does not install it. Add it to your project (for example \`npm install --save-dev playwright\`), then download its browser with \`npx playwright install chromium\`.`,
      { cause: error }
    );
  }
  try {
    return await playwright.chromium.launch();
  } catch (error) {
    throw new Error(
      `@discordkit/preview/node found \`playwright\` but could not launch Chromium: ${error instanceof Error ? error.message.split(`\n`)[0] : String(error)}. Usually this means Playwright's browser has not been downloaded on this machine. Run \`npx playwright install chromium\`, or launch a browser yourself (for example \`chromium.launch({ channel: "chrome" })\` to use an installed Chrome) and pass it as \`renderScene(scene, { browser })\`.`,
      { cause: error }
    );
  }
};

/** Reads the pixel size out of a PNG's header chunk. */
const pngSize = (png: Buffer): { width: number; height: number } => ({
  width: png.readUInt32BE(16),
  height: png.readUInt32BE(20)
});

/** Every image reference the scene draws, found by rendering it once with a resolver that only records what it is asked for. The components decide which images they need, so this cannot drift from what they draw. */
const collectReferences = (scene: Scene): string[] => {
  const references: string[] = [];
  const record: AssetUrl = (reference) => {
    references.push(reference);
    return reference;
  };
  renderToStaticMarkup(
    createElement(SceneView, { ...scene, assetUrl: record })
  );
  return references;
};

/** Gives each loaded image a URL on the asset origin, numbered in the order the scene first uses it, so the page is the same text on every render. */
const serveAssets = (
  references: readonly string[],
  assets: Map<string, LoadedAsset>
): {
  assetUrl: AssetUrl;
  served: Map<string, LoadedAsset & { reference: string }>;
} => {
  const urls = new Map<string, string>();
  const served = new Map<string, LoadedAsset & { reference: string }>();
  for (const reference of new Set(references)) {
    const asset = assets.get(reference);
    if (asset) {
      const url = `${assetOrigin}/${String(served.size)}`;
      urls.set(reference, url);
      served.set(url, { ...asset, reference });
    }
  }
  return {
    assetUrl: (reference) =>
      reference.startsWith(`data:`) ? reference : (urls.get(reference) ?? null),
    served
  };
};

const undecodable = (reference: string): Finding => ({
  code: `asset-undecodable`,
  asset: reference,
  message: `@discordkit/preview drew a placeholder for ${reference}, because Chromium could not decode the image it loaded. The file is probably not the image format its type says, or is damaged. Check the file (or, for a URL, the cached copy, by deleting the asset cache and rendering again).`
});

/**
 * Draws a scene the way the Discord web client would and returns a PNG of the chat column holding its messages, with findings about anything that could not be drawn as asked.
 *
 * The scene is server-rendered with React, loaded with the package's stylesheet, the bundled Noto Sans and the images it needs into headless Chromium, and screenshotted once its fonts and images have loaded, with animations off. The images are fetched (or read from the asset cache) before the browser starts, and the browser is refused every request the renderer does not answer itself.
 */
export const renderScene = async (
  scene: Scene,
  {
    scale = 1,
    browser: givenBrowser,
    cacheDir = defaultCacheDir(),
    offline = false
  }: RenderOptions = {}
): Promise<RenderResult> => {
  // Checked first, so a bad clock, zone or locale fails before anything is fetched. The canonical locale is also safe to write into the page.
  const { locale } = resolveClock(scene);
  const references = collectReferences(scene);
  const [stylesheet, faces, loaded] = await Promise.all([
    loadStylesheet(),
    fontFaces(),
    loadAssets(references, {
      cacheDir,
      offline,
      attachments: scene.context?.attachments,
      fetch: globalThis.fetch
    })
  ]);
  const { assetUrl, served } = serveAssets(references, loaded.assets);
  const markup = renderToStaticMarkup(
    createElement(SceneView, { ...scene, assetUrl })
  );
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>${faces}</style><style>${stylesheet}</style><style>${fontStackOverride}${determinism}</style></head><body>${markup}</body></html>`;

  const browser = givenBrowser ?? (await launchChromium());
  try {
    const context = await browser.newContext({
      viewport: { width: scene.width ?? defaultWidth, height: 600 },
      deviceScaleFactor: scale,
      locale,
      timezoneId: `UTC`,
      reducedMotion: `reduce`
    });
    try {
      const page = await context.newPage();
      // Serve the page, its fonts and its images from memory, and refuse everything else, so a render never reaches the network.
      await page.route(`**/*`, async (route) => {
        const url = route.request().url();
        if (url === `${pageOrigin}/`) {
          await route.fulfill({ contentType: `text/html`, body: html });
          return;
        }
        const asset = served.get(url);
        if (asset) {
          await route.fulfill({
            contentType: asset.contentType,
            body: asset.body
          });
          return;
        }
        const font = url.startsWith(`${fontOrigin}/`)
          ? await readFont(url)
          : undefined;
        await (font
          ? route.fulfill({ contentType: `font/woff2`, body: font })
          : route.abort());
      });
      await page.goto(`${pageOrigin}/`);
      const fontsLoaded = await page.evaluate(async () => {
        // Load the Latin face even if the scene has no text, so the check below has something to confirm.
        await document.fonts.load(`16px "Noto Sans"`);
        // Reading a layout property forces layout, which is what requests the faces the scene's text needs; only then does `ready` wait for them.
        void document.body.offsetHeight;
        await document.fonts.ready;
        const faces = [...document.fonts].filter(
          (face) => face.family.replaceAll(`"`, ``) === `Noto Sans`
        );
        return (
          faces.some((face) => face.status === `loaded`) &&
          !faces.some((face) => face.status === `error`)
        );
      });
      if (!fontsLoaded) {
        throw new Error(
          `@discordkit/preview/node rendered the scene, but Chromium did not load the bundled Noto Sans, so the image would use whatever fallback font the machine has. Check that \`@fontsource-variable/noto-sans\` is installed beside @discordkit/preview and that its \`files/\` directory is intact, then render again.`
        );
      }
      // Wait for every image, then swap any that would not decode for the placeholder, so the image never shows the browser's broken-image icon.
      const broken = await page.evaluate(
        async ({ pixel, placeholder }) => {
          const images = [...document.images];
          await Promise.all(
            images.map(async (image) => image.decode().catch(() => undefined))
          );
          const failed = images.filter(
            (image) => image.src !== pixel && image.naturalWidth === 0
          );
          const urls = failed.map((image) => image.src);
          for (const image of failed) {
            image.src = pixel;
            image.classList.add(placeholder);
          }
          await Promise.all(
            failed.map(async (image) => image.decode().catch(() => undefined))
          );
          return urls;
        },
        { pixel: transparentPixel, placeholder: placeholderClass }
      );
      const findings = [
        ...loaded.findings,
        ...[...new Set(broken)].map((url) =>
          undecodable(served.get(url)?.reference ?? url)
        )
      ];
      const png = await page
        .locator(sceneSelector)
        .screenshot({ animations: `disabled`, caret: `hide`, scale: `device` });
      return { png, ...pngSize(png), findings };
    } finally {
      await context.close();
    }
  } finally {
    if (!givenBrowser) await browser.close();
  }
};
