import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

/** The bundled Noto Sans, from `@fontsource-variable/noto-sans`: one variable-weight file per Unicode subset and style. */
const fontPackage = dirname(
  require.resolve(`@fontsource-variable/noto-sans/package.json`)
);

/** Where the page asks for font files. The renderer answers these requests itself, from `fontPackage`, so nothing goes to the network. */
export const fontOrigin = `https://fonts.discordkit-preview.invalid`;

/** Upright and italic. gg sans has a true italic, so italic text is drawn from Noto Sans Italic rather than slanted by the browser. */
const styles = [`normal`, `italic`] as const;

const fileFor = (subset: string, style: (typeof styles)[number]): string =>
  `noto-sans-${subset}-wght-${style}.woff2`;

/**
 * The family the Node renderer starts its font stacks with, in place of gg sans and gg mono. Discord's stacks name those first, so a machine with either installed would render differently from one without; starting at a font the renderer controls keeps the image the same. Noto Sans is bundled; Source Code Pro is the next family in Discord's code stack, and is used only where it is installed.
 */
export const fontStackOverride = `[data-discordkit-preview-scene]{--dkp-font-brand:"Noto Sans";--dkp-font-code-brand:"Source Code Pro"}`;

/**
 * `@font-face` rules that make the family name `Noto Sans` resolve to the bundled files. A web font declared under a family name takes precedence over an installed font of the same name, so the output does not depend on whether the machine has Noto Sans installed.
 */
export const fontFaces = async (): Promise<string> => {
  // The package's map of subset name to `unicode-range`, e.g. `"latin": "U+0000-00FF,…"`.
  const ranges: Record<string, string> = JSON.parse(
    await readFile(join(fontPackage, `unicode.json`), `utf8`)
  );
  return styles
    .flatMap((style) =>
      Object.entries(ranges).map(
        ([subset, range]) =>
          `@font-face{font-family:"Noto Sans";font-style:${style};font-weight:100 900;font-display:block;src:url(${fontOrigin}/${fileFor(subset, style)}) format("woff2");unicode-range:${range}}`
      )
    )
    .join(`\n`);
};

/** Reads the font file a page request names, or `undefined` when the request is for something the bundle does not have. */
export const readFont = async (url: string): Promise<Buffer | undefined> => {
  const file = url.slice(fontOrigin.length + 1);
  if (!/^noto-sans-[a-z-]+-wght-(?:normal|italic)\.woff2$/.test(file)) {
    return undefined;
  }
  return readFile(join(fontPackage, `files`, file));
};
