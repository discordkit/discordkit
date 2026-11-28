import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

/** The bundled Noto Sans, from `@fontsource-variable/noto-sans`: one variable-weight file per Unicode subset, upright only for now. */
const fontPackage = dirname(
  require.resolve(`@fontsource-variable/noto-sans/package.json`)
);

/** Where the page asks for font files. The renderer answers these requests itself, from `fontPackage`, so nothing goes to the network. */
export const fontOrigin = `https://fonts.discordkit-preview.invalid`;

const fileFor = (subset: string): string =>
  `noto-sans-${subset}-wght-normal.woff2`;

/**
 * `@font-face` rules that make the family name `Noto Sans` resolve to the bundled files. A web font declared under a family name takes precedence over an installed font of the same name, so the output does not depend on whether the machine has Noto Sans installed.
 */
export const fontFaces = async (): Promise<string> => {
  // The package's map of subset name to `unicode-range`, e.g. `"latin": "U+0000-00FF,…"`.
  const ranges: Record<string, string> = JSON.parse(
    await readFile(join(fontPackage, `unicode.json`), `utf8`)
  );
  return Object.entries(ranges)
    .map(
      ([subset, range]) =>
        `@font-face{font-family:"Noto Sans";font-style:normal;font-weight:100 900;font-display:block;src:url(${fontOrigin}/${fileFor(subset)}) format("woff2");unicode-range:${range}}`
    )
    .join(`\n`);
};

/** Reads the font file a page request names, or `undefined` when the request is for something the bundle does not have. */
export const readFont = async (url: string): Promise<Buffer | undefined> => {
  const file = url.slice(fontOrigin.length + 1);
  if (!/^noto-sans-[a-z-]+-wght-normal\.woff2$/.test(file)) return undefined;
  return readFile(join(fontPackage, `files`, file));
};
