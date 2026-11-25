import { readdir, readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, extname, join, resolve } from "node:path";
import { readFontDescriptors } from "./fontFile.js";

const require = createRequire(import.meta.url);

const packageDir = (name: string): string =>
  dirname(require.resolve(`${name}/package.json`));

/** Where the page asks for font files. The renderer answers these requests itself, from the files each face names, so nothing goes to the network. */
export const fontOrigin = `https://fonts.discordkit-preview.invalid`;

/**
 * How Chinese, Japanese and Korean text is drawn.
 *
 * - `system`: with the fonts installed on this machine, through the fallback stack Discord uses for the scene's locale, as the real client does. The image then depends on the machine: under an English locale, Windows draws kanji in a Chinese-design font.
 * - `noto-sans-jp`: with the bundled Noto Sans JP, a Japanese-design font, so the image is the same on every machine. Korean Hangul is not in it and still falls back to the machine's fonts.
 */
export type CjkFont = `system` | `noto-sans-jp`;

export const cjkFonts: readonly CjkFont[] = [`system`, `noto-sans-jp`];

export interface FontOptions {
  /** A gg sans font file (`.ttf`, `.otf`, `.woff` or `.woff2`) or a directory of them. Each file's weight and style are read from the file itself. Without one, text starts at the bundled Noto Sans. */
  ggSans?: string;
  /** Defaults to `system`. */
  cjk?: CjkFont;
}

/** One `@font-face` rule the page declares, and the file that answers the URL it names. */
export interface DeclaredFace {
  url: string;
  rule: string;
  file: string;
  contentType: string;
}

export interface FontSet {
  faces: DeclaredFace[];
  /** CSS that starts the scene's font stacks at the fonts this set declares, in place of gg sans and gg mono. */
  stack: string;
  /** The family the stack starts with, which the renderer loads before drawing to check that its files work. */
  brand: `Noto Sans` | `gg sans`;
}

const face = (
  family: string,
  descriptors: string,
  url: string,
  format: string
): string =>
  `@font-face{font-family:"${family}";${descriptors}font-display:block;src:url(${url}) format("${format}")}`;

/** A fontsource variable package: one file per Unicode subset and style, with the subsets' ranges in its `unicode.json`. A web font declared under a family name takes precedence over an installed font of the same name, so the output does not depend on whether the machine has it. */
const fontsource = async (
  name: string,
  family: string,
  slug: string,
  styles: ReadonlyArray<`normal` | `italic`>
): Promise<DeclaredFace[]> => {
  const directory = packageDir(name);
  // The package's map of subset name to `unicode-range`, e.g. `"latin": "U+0000-00FF,…"`, or `"[12]": "…"` for a numbered CJK slice.
  const ranges: Record<string, string> = JSON.parse(
    await readFile(join(directory, `unicode.json`), `utf8`)
  );
  return styles.flatMap((style) =>
    Object.entries(ranges).map(([subset, range]) => {
      const file = `${slug}-${subset.replace(/^\[(\d+)\]$/, `$1`)}-wght-${style}.woff2`;
      const url = `${fontOrigin}/${slug}/${file}`;
      return {
        url,
        rule: face(
          family,
          `font-style:${style};font-weight:100 900;unicode-range:${range};`,
          url,
          `woff2`
        ),
        file: join(directory, `files`, file),
        contentType: `font/woff2`
      };
    })
  );
};

const fontFormats: Partial<Record<string, { format: string; type: string }>> = {
  ".otf": { format: `opentype`, type: `font/otf` },
  ".ttf": { format: `truetype`, type: `font/ttf` },
  ".woff": { format: `woff`, type: `font/woff` },
  ".woff2": { format: `woff2`, type: `font/woff2` }
};

const reasonOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const ggSansFiles = async (given: string): Promise<string[]> => {
  const path = resolve(given);
  let isDirectory: boolean;
  try {
    isDirectory = (await stat(path)).isDirectory();
  } catch (error) {
    throw new Error(
      `@discordkit/preview could not find the gg sans font at ${path}: ${reasonOf(error)}. The path should be a gg sans font file (.ttf, .otf, .woff or .woff2) or a directory holding them, and a relative path is resolved against the working directory (${process.cwd()}). Check the path, or leave the option out to draw with the bundled Noto Sans.`,
      { cause: error }
    );
  }
  if (!isDirectory) {
    if (fontFormats[extname(path).toLowerCase()] === undefined) {
      throw new Error(
        `@discordkit/preview cannot use ${path} as gg sans, because it does not have a font extension it reads (.ttf, .otf, .woff or .woff2). Point the option at a gg sans font file with one of those extensions, or at a directory holding them.`
      );
    }
    return [path];
  }
  const files = (await readdir(path))
    .filter((name) => fontFormats[extname(name).toLowerCase()] !== undefined)
    .sort()
    .map((name) => join(path, name));
  if (files.length === 0) {
    throw new Error(
      `@discordkit/preview found no font files in ${path}, so it has no gg sans to draw with. It reads .ttf, .otf, .woff and .woff2 files directly inside the directory, not in subdirectories. Point the option at the directory that holds the gg sans files, or at one file.`
    );
  }
  return files;
};

/** `@font-face` rules declaring the family `gg sans` from a developer's own copy of it, one per file, each with the weight and style the file declares. */
const ggSansFaces = async (given: string): Promise<DeclaredFace[]> => {
  const files = await ggSansFiles(given);
  const described = await Promise.all(
    files.map(async (file) => {
      try {
        return readFontDescriptors(await readFile(file));
      } catch (error) {
        throw new Error(
          `@discordkit/preview could not read ${file} as gg sans, because ${reasonOf(error)}. Supply gg sans as .ttf, .otf, .woff or .woff2 files holding one font each, or leave the option out to draw with the bundled Noto Sans.`,
          { cause: error }
        );
      }
    })
  );
  const seen = new Map<string, string>();
  return files.map((file, index) => {
    const descriptors = described[index];
    const key = `${descriptors.weight} ${descriptors.style}`;
    const earlier = seen.get(key);
    if (earlier !== undefined) {
      throw new Error(
        `@discordkit/preview found two gg sans files for the same weight and style (${key}): ${basename(earlier)} and ${basename(file)}. The browser would draw with only one of them, and which one is not obvious. Keep one file per weight and style in the directory, for example only the .woff2 files.`
      );
    }
    seen.set(key, file);
    const extension = extname(file).toLowerCase();
    const { format = `woff2`, type = `font/woff2` } =
      fontFormats[extension] ?? {};
    const url = `${fontOrigin}/gg-sans/${String(index)}${extension}`;
    return {
      url,
      rule: face(
        `gg sans`,
        `font-style:${descriptors.style};font-weight:${descriptors.weight};`,
        url,
        format
      ),
      file,
      contentType: type
    };
  });
};

/**
 * The CSS that starts the scene's font stacks at fonts the renderer controls, in place of gg sans and gg mono. Discord's stacks name those first, so a machine with either installed would render differently from one without.
 *
 * The first family is supplied gg sans when there is one and the bundled Noto Sans otherwise. Pinning CJK puts Noto Sans JP right after the Latin fonts, ahead of the locale's system fonts, so CJK text never reaches them. Source Code Pro is the next family in Discord's code stack, and is used only where it is installed.
 */
export const fontStack = ({ ggSans, cjk = `system` }: FontOptions): string => {
  const families = ggSans === undefined ? [`"Noto Sans"`] : [`"gg sans"`];
  if (cjk === `noto-sans-jp`) {
    if (ggSans !== undefined) families.push(`"Noto Sans"`);
    families.push(`"Noto Sans JP"`);
  }
  return `[data-discordkit-preview-scene]{--dkp-font-brand:${families.join(`,`)};--dkp-font-code-brand:"Source Code Pro"}`;
};

/** {@link fontStack} with neither option: Noto Sans first, CJK from the machine. */
export const fontStackOverride = fontStack({});

/**
 * Every face the page may need: the bundled Noto Sans (upright and italic, since gg sans has a true italic), supplied gg sans when given, and Noto Sans JP when CJK is pinned. The browser fetches only the faces whose Unicode range the scene's text uses.
 */
export const loadFonts = async ({
  ggSans,
  cjk = `system`
}: FontOptions = {}): Promise<FontSet> => {
  const faces = [
    ...(ggSans === undefined ? [] : await ggSansFaces(ggSans)),
    ...(await fontsource(
      `@fontsource-variable/noto-sans`,
      `Noto Sans`,
      `noto-sans`,
      [`normal`, `italic`]
    )),
    ...(cjk === `noto-sans-jp`
      ? await fontsource(
          `@fontsource-variable/noto-sans-jp`,
          `Noto Sans JP`,
          `noto-sans-jp`,
          [`normal`]
        )
      : [])
  ];
  return {
    faces,
    stack: fontStack({ ggSans, cjk }),
    brand: ggSans === undefined ? `Noto Sans` : `gg sans`
  };
};
