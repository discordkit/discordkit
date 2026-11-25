import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type * as Playwright from "playwright";
import type { Browser, Page } from "playwright";
import type { Finding } from "../findings.js";
import type { Scene } from "../scene.js";
import { defaultWidth } from "../scene.js";
import { resolveClock } from "../format/timestamp.js";
import { placeholderClass, transparentPixel } from "../react/Image.js";
import { measureAttribute } from "../react/MediaGallery.js";
import { Scene as SceneView, sceneSelector } from "../react/Scene.js";
import type { AssetUrl } from "../react/SceneContext.js";
import {
  defaultCacheDir,
  loadAssets,
  locate,
  placeholderFinding,
  type AssetFinding,
  type LoadedAsset
} from "./assets.js";
import { describeFonts, hasCjk, type FontReport } from "./fontReport.js";
import { loadFonts, type CjkFont, type DeclaredFace } from "./fonts.js";

export interface RenderOptions {
  /** Device pixels per CSS pixel. Defaults to 1. */
  scale?: number;
  /** A Chromium browser to render in. Passing one skips the launch, which is most of a single render's cost; the caller closes it. Without one, a headless Chromium is launched for this render and closed after. */
  browser?: Browser;
  /** Where fetched images (avatars, emoji) are cached between renders. Defaults to `node_modules/.cache/@discordkit/preview/assets` under the working directory. Delete it to fetch everything afresh. */
  cacheDir?: string;
  /** Draw only images that are already cached: a cache miss becomes a placeholder and a finding instead of a fetch. Defaults to false. */
  offline?: boolean;
  /** Your own copy of gg sans, Discord's font, which cannot be bundled: a font file (`.ttf`, `.otf`, `.woff` or `.woff2`) or a directory of them. Each file's weight and style are read from the file. Without it, text starts at the bundled Noto Sans, so line breaks can differ from the real client. */
  ggSans?: string;
  /** How Chinese, Japanese and Korean text is drawn: `system` (the default) leaves it to this machine's fonts, as the real client does; `noto-sans-jp` pins it to the bundled Noto Sans JP, so the image is the same on every machine. */
  cjk?: CjkFont;
  /** Also return the page as one self-contained HTML document, with its stylesheet, fonts and images inlined. Defaults to false. */
  html?: boolean;
}

export interface RenderResult {
  png: Buffer;
  /** Width of the image in device pixels: the scene width times `scale`. */
  width: number;
  /** Height of the image in device pixels. */
  height: number;
  /** Images drawn as placeholders, and why, each with the path where the scene names it and the image in `asset`. Empty when everything was drawn as asked. */
  findings: Array<Finding & { asset: string }>;
  /** Which fonts drew the text, and whether the image depends on the fonts installed on this machine. */
  fonts: FontReport;
  /** The page as one file that opens anywhere with no scripts and no network: present when `html` was asked for. Spoilers reveal on click. Only the font files the text uses are inlined; with `cjk: "system"`, CJK text uses the viewer's own fonts. */
  html?: string;
}

/** Thrown by {@link renderScene} when the scene itself cannot be drawn, such as a component the renderer does not support yet, as opposed to a browser or file that failed. Its message says what to change in the scene. */
export class UndrawableSceneError extends Error {
  override name = `UndrawableSceneError`;
}

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

/** Every image reference the scene draws, found by rendering it once with a resolver that only records what it is asked for. The components decide which images they need, so this cannot drift from what they draw. This is also the first time the scene is drawn, so a scene the components refuse fails here, before anything is fetched or launched. */
const collectReferences = (scene: Scene): string[] => {
  const references: string[] = [];
  const record: AssetUrl = (reference) => {
    references.push(reference);
    return reference;
  };
  try {
    renderToStaticMarkup(
      createElement(SceneView, { ...scene, assetUrl: record })
    );
  } catch (error) {
    throw new UndrawableSceneError(
      error instanceof Error ? error.message : String(error),
      { cause: error }
    );
  }
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

const undecodable = (reference: string): AssetFinding =>
  placeholderFinding(
    `asset-undecodable`,
    reference,
    `@discordkit/preview drew a placeholder for ${reference}, because Chromium could not decode the image it loaded. The file is probably not the image format its type says, or is damaged. Check the file (or, for a URL, the cached copy, by deleting the asset cache and rendering again).`
  );

const dataUri = (contentType: string, body: Buffer): string =>
  `data:${contentType};base64,${body.toString(`base64`)}`;

/** Every font that drew the scene's text, as Chromium reports it: by the family name inside the font file, and whether it was one the page declared or one installed on this machine. */
const fontsUsed = async (
  page: Page
): Promise<Array<{ family: string; system: boolean; glyphs: number }>> => {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send(`DOM.enable`);
    await cdp.send(`CSS.enable`);
    const { root } = await cdp.send(`DOM.getDocument`, { depth: -1 });
    // Asked of an element, Chromium reports only part of what is under it, so ask of each text node: those answers do not overlap.
    const textNodes: number[] = [];
    const collect = (node: typeof root, inScene: boolean): void => {
      const scene =
        inScene ||
        (node.attributes ?? []).includes(`data-discordkit-preview-scene`);
      if (scene && node.nodeType === 3 && node.nodeValue.trim() !== ``) {
        textNodes.push(node.nodeId);
      }
      for (const child of node.children ?? []) collect(child, scene);
    };
    collect(root, false);
    const reports = await Promise.all(
      textNodes.map(async (nodeId) =>
        cdp.send(`CSS.getPlatformFontsForNode`, { nodeId })
      )
    );
    return reports.flatMap(({ fonts }) =>
      fonts.map((font) => ({
        family: font.familyName,
        system: !font.isCustomFont,
        glyphs: font.glyphCount
      }))
    );
  } finally {
    await cdp.detach();
  }
};

/** The page as one file: the faces the text used and the images it shows inlined as `data:` URLs, after every change the renderer made to it in the browser (placeholders, gallery shapes). */
const selfContained = async ({
  page,
  locale,
  faces,
  requested,
  served,
  stylesheet,
  stack
}: {
  page: Page;
  locale: string;
  faces: readonly DeclaredFace[];
  requested: ReadonlySet<string>;
  served: ReadonlyMap<string, LoadedAsset>;
  stylesheet: string;
  stack: string;
}): Promise<string> => {
  const inlined = await Promise.all(
    faces
      .filter((declared) => requested.has(declared.url))
      .map(async (declared) =>
        declared.rule.replace(
          declared.url,
          dataUri(declared.contentType, await readFile(declared.file))
        )
      )
  );
  const body = (await page.evaluate(() => document.body.innerHTML)).replaceAll(
    new RegExp(`${assetOrigin.replaceAll(`.`, `\\.`)}/\\d+`, `g`),
    (url) => {
      const asset = served.get(url);
      return asset ? dataUri(asset.contentType, asset.body) : transparentPixel;
    }
  );
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><title>Discord message preview</title><style>${inlined.join(`\n`)}</style><style>${stylesheet}</style><style>${stack}${determinism}</style></head><body>${body}</body></html>`;
};

/**
 * Draws a scene the way the Discord web client would and returns a PNG of the chat column holding its messages, with findings about anything that could not be drawn as asked and a report of the fonts that drew the text.
 *
 * The scene is server-rendered with React, loaded with the package's stylesheet, the bundled fonts and the images it needs into headless Chromium, and screenshotted once its fonts and images have loaded, with animations off. The images are fetched (or read from the asset cache) before the browser starts, and the browser is refused every request the renderer does not answer itself.
 *
 * Throws {@link UndrawableSceneError} for a scene the renderer cannot draw, and a plain error when the browser, the stylesheet or a supplied font cannot be had.
 */
export const renderScene = async (
  scene: Scene,
  {
    scale = 1,
    browser: givenBrowser,
    cacheDir = defaultCacheDir(),
    offline = false,
    ggSans,
    cjk = `system`,
    html: wantHtml = false
  }: RenderOptions = {}
): Promise<RenderResult> => {
  // Checked first, so a bad clock, zone or locale fails before anything is fetched. The canonical locale is also safe to write into the page.
  const { locale } = resolveClock(scene);
  const references = collectReferences(scene);
  const [stylesheet, fonts, loaded] = await Promise.all([
    loadStylesheet(),
    loadFonts({ ggSans, cjk }),
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
  const faceCss = fonts.faces.map((declared) => declared.rule).join(`\n`);
  const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>${faceCss}</style><style>${stylesheet}</style><style>${fonts.stack}${determinism}</style></head><body>${markup}</body></html>`;
  const faceByUrl = new Map(
    fonts.faces.map((declared) => [declared.url, declared])
  );
  /** The fonts the page asked for, which are the ones its text uses. */
  const requested = new Set<string>();

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
        const declared = faceByUrl.get(url);
        if (declared) {
          requested.add(url);
          await route.fulfill({
            contentType: declared.contentType,
            body: await readFile(declared.file)
          });
          return;
        }
        await route.abort();
      });
      await page.goto(`${pageOrigin}/`);
      const fontsLoaded = await page.evaluate(async (brand) => {
        // Load the first family in the stack even if the scene has no text, so the check below has something to confirm.
        await document.fonts.load(`16px "${brand}"`);
        // Reading a layout property forces layout, which is what requests the faces the scene's text needs; only then does `ready` wait for them.
        void document.body.offsetHeight;
        await document.fonts.ready;
        const faces = [...document.fonts];
        const brandFaces = faces.filter(
          (face) => face.family.replaceAll(`"`, ``) === brand
        );
        return {
          brand: brandFaces.some((face) => face.status === `loaded`),
          failed: faces
            .filter((face) => face.status === `error`)
            .map((face) => face.family.replaceAll(`"`, ``))
        };
      }, fonts.brand);
      if (
        fonts.brand === `gg sans` &&
        (!fontsLoaded.brand || fontsLoaded.failed.includes(`gg sans`))
      ) {
        throw new Error(
          `@discordkit/preview/node rendered the scene, but Chromium could not load the gg sans files supplied from ${ggSans ?? ``}, so the image would not show gg sans. The files are probably damaged or not fonts Chromium accepts. Check them (each should open in a font viewer), or leave the gg sans option out to draw with the bundled Noto Sans.`
        );
      }
      if (!fontsLoaded.brand || fontsLoaded.failed.length > 0) {
        throw new Error(
          `@discordkit/preview/node rendered the scene, but Chromium did not load the bundled fonts (${[...new Set(fontsLoaded.failed)].join(`, `) || fonts.brand}), so the image would use whatever fallback font the machine has. Check that \`@fontsource-variable/noto-sans\` and \`@fontsource-variable/noto-sans-jp\` are installed beside @discordkit/preview and that their \`files/\` directories are intact, then render again.`
        );
      }
      // Wait for every image, then swap any that would not decode for the placeholder, so the image never shows the browser's broken-image icon. Then give each gallery item whose shape the payload did not state its picture's aspect ratio, which is what a browser's `onLoad` does and server rendering cannot.
      const broken = await page.evaluate(
        async ({ pixel, placeholder, measure }) => {
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
            image.setAttribute(`data-discordkit-preview-missing`, image.alt);
          }
          await Promise.all(
            failed.map(async (image) => image.decode().catch(() => undefined))
          );
          for (const item of document.querySelectorAll<HTMLElement>(
            `[${measure}]`
          )) {
            const image = item.querySelector(`img`);
            if (image && image.naturalWidth > 0 && image.naturalHeight > 0) {
              item.style.setProperty(
                `--dkp-ratio`,
                String(image.naturalWidth / image.naturalHeight)
              );
            }
          }
          return urls;
        },
        {
          pixel: transparentPixel,
          placeholder: placeholderClass,
          measure: measureAttribute
        }
      );
      const findings = [
        ...loaded.findings,
        ...[...new Set(broken)].map((url) =>
          undecodable(served.get(url)?.reference ?? url)
        )
      ].map((finding) => ({ ...finding, path: locate(scene, finding.asset) }));
      const text = await page.evaluate(
        (selector) => document.querySelector(selector)?.textContent ?? ``,
        sceneSelector
      );
      const report = describeFonts(await fontsUsed(page), {
        cjkText: hasCjk(text),
        cjk
      });
      const png = await page
        .locator(sceneSelector)
        .screenshot({ animations: `disabled`, caret: `hide`, scale: `device` });
      return {
        png,
        ...pngSize(png),
        findings,
        fonts: report,
        ...(wantHtml
          ? {
              html: await selfContained({
                page,
                locale,
                faces: fonts.faces,
                requested,
                served,
                stylesheet,
                stack: fonts.stack
              })
            }
          : {})
      };
    } finally {
      await context.close();
    }
  } finally {
    if (!givenBrowser) await browser.close();
  }
};
