import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type * as Playwright from "playwright";
import type { Browser } from "playwright";
import type { Scene } from "../scene.js";
import { defaultWidth } from "../scene.js";
import { Scene as SceneView, sceneSelector } from "../react/Scene.js";
import { fontFaces, fontOrigin, readFont } from "./fonts.js";

export interface RenderOptions {
  /** Device pixels per CSS pixel. Defaults to 1. */
  scale?: number;
  /** A browser to render in. Passing one skips the launch, which is most of a single render's cost; the caller closes it. Without one, a headless Chromium is launched for this render and closed after. */
  browser?: Browser;
}

export interface RenderResult {
  png: Buffer;
  /** Width of the image in device pixels: the scene width times `scale`. */
  width: number;
  /** Height of the image in device pixels. */
  height: number;
}

/** The compiled stylesheet `vp pack` writes beside this module's directory: `dist/styles.css`. */
const stylesheetUrl = new URL(`../styles.css`, import.meta.url);

const pageOrigin = `https://scene.discordkit-preview.invalid`;

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

/**
 * Draws a scene the way the Discord web client would and returns a PNG of the chat column holding its messages.
 *
 * The scene is server-rendered with React, loaded with the package's stylesheet and the bundled Noto Sans into headless Chromium, and screenshotted once its fonts have loaded, with animations off.
 */
export const renderScene = async (
  scene: Scene,
  { scale = 1, browser: givenBrowser }: RenderOptions = {}
): Promise<RenderResult> => {
  const [stylesheet, faces] = await Promise.all([
    loadStylesheet(),
    fontFaces()
  ]);
  const markup = renderToStaticMarkup(createElement(SceneView, scene));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${faces}</style><style>${stylesheet}</style><style>${determinism}</style></head><body>${markup}</body></html>`;

  const browser = givenBrowser ?? (await launchChromium());
  try {
    const context = await browser.newContext({
      viewport: { width: scene.width ?? defaultWidth, height: 600 },
      deviceScaleFactor: scale,
      locale: `en-US`,
      timezoneId: `UTC`,
      reducedMotion: `reduce`
    });
    try {
      const page = await context.newPage();
      // Serve the page and its fonts from memory, and refuse everything else, so a render never reaches the network.
      await page.route(`**/*`, async (route) => {
        const url = route.request().url();
        if (url === `${pageOrigin}/`) {
          await route.fulfill({ contentType: `text/html`, body: html });
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
      const png = await page
        .locator(sceneSelector)
        .screenshot({ animations: `disabled`, caret: `hide`, scale: `device` });
      return { png, ...pngSize(png) };
    } finally {
      await context.close();
    }
  } finally {
    if (!givenBrowser) await browser.close();
  }
};
