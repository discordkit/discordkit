import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { parseArgs } from "node:util";
import type * as Playwright from "playwright";
import type { Browser } from "playwright";
import { hasErrors } from "../findings.js";
import { resolveClock } from "../format/timestamp.js";
import { lint } from "../lint/index.js";
import { cjkFonts } from "../node/fonts.js";
import { render, type RenderInputResult } from "../node/render.js";
import type { Theme } from "../scene.js";
import {
  choiceOption,
  CliError,
  exitCodes,
  integerOption,
  print,
  printFindings,
  printJson,
  program,
  readInputs,
  tally,
  type Input
} from "./shared.js";

export const renderUsage = `Usage: ${program} render [input...] [options]

Draws each input the way the Discord web client would and writes a PNG (or, with --html, a self-contained HTML file). An input is a JSON file holding a scene, a message payload, an array of components or one component, in snake_case or camelCase. With no input, or \`-\`, it reads standard input. Several inputs share one browser, so render them in one call.

The image is written even when the message has errors, as long as it can be drawn. A message holding a component the renderer does not support yet is not drawn, and a finding says so.

Options:
  -o, --out <file>        Where to write the image. Only with one input.
      --out-dir <dir>     Write each image here, named after its input. Without
                          --out or --out-dir, each image is written beside its
                          input file (preview.png in the working directory for
                          standard input).
      --html              Write one self-contained HTML file instead of a PNG:
                          markup, stylesheet, and the fonts and images it uses
                          inlined, with no scripts and no network requests.
      --theme <name>      light, ash, dark or onyx. Replaces the scene's.
      --width <px>        Width of the chat column in CSS pixels. Default 600.
      --scale <n>         Device pixels per CSS pixel, 1 to 4. Default 1.
      --now <iso>         The scene's clock, e.g. 2026-11-25T16:05:00Z.
      --time-zone <iana>  The viewer's time zone, e.g. Asia/Tokyo. Default UTC.
      --locale <tag>      The viewer's Discord language, e.g. ja. Default en-US.
                          It also picks Discord's CJK font stack.
      --gg-sans <path>    Your own copy of gg sans, Discord's font, which cannot
                          be bundled: a .ttf, .otf, .woff or .woff2 file, or a
                          directory of them. Default: the bundled Noto Sans.
      --cjk <font>        system (default): Chinese, Japanese and Korean text
                          uses this machine's fonts, as the real client does, so
                          the image differs between machines. noto-sans-jp: pin
                          it to the bundled Japanese-design Noto Sans JP, so the
                          image is the same everywhere.
      --offline           Use only images already in the cache; a miss is
                          drawn as a placeholder and reported.
      --cache-dir <dir>   Where fetched images are cached. Default
                          node_modules/.cache/@discordkit/preview/assets.
      --channel <name>    Drive an installed browser instead of Playwright's
                          Chromium: chrome, msedge, chrome-beta and so on.
      --json              Print one JSON document on standard output.
  -h, --help              Show this help.

Exit status: 0 drawn with no errors, 1 an input has errors or could not be drawn, 2 could not run.`;

const themes: readonly Theme[] = [`light`, `ash`, `dark`, `onyx`];

/** Fails the run before anything is drawn when a clock option cannot be used, with the renderer's own explanation. */
const clockOption = (
  name: string,
  field: `now` | `timeZone` | `locale`,
  value: string | undefined
): string | undefined => {
  if (value === undefined) return undefined;
  try {
    resolveClock({ [field]: value });
  } catch (error) {
    throw new CliError(
      `${program} cannot use \`--${name} ${value}\`. ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
  return value;
};

const launchBrowser = async (channel: string | undefined): Promise<Browser> => {
  let playwright: typeof Playwright;
  try {
    playwright = await import(`playwright`);
  } catch (error) {
    throw new CliError(
      `${program} render could not load \`playwright\`, which it uses to drive a headless browser. It is an optional peer dependency of @discordkit/preview, so it is not installed with it. Install it in this project (for example \`npm install --save-dev playwright\`), then download its browser with \`npx playwright install chromium\`. The lint, codegen and diff commands do not need it.`,
      { cause: error }
    );
  }
  try {
    return await playwright.chromium.launch(
      channel === undefined ? {} : { channel }
    );
  } catch (error) {
    const reason =
      error instanceof Error ? error.message.split(`\n`)[0] : String(error);
    throw new CliError(
      channel === undefined
        ? `${program} render found \`playwright\` but could not launch its Chromium: ${reason}. Usually this means Playwright's browser has not been downloaded on this machine. Run \`npx playwright install chromium\`, or pass \`--channel chrome\` to use an installed Google Chrome (\`--channel msedge\` for Microsoft Edge).`
        : `${program} render could not launch the browser for \`--channel ${channel}\`: ${reason}. That browser is probably not installed on this machine. Install it, pass another channel, or leave \`--channel\` out to use Playwright's Chromium (downloaded with \`npx playwright install chromium\`).`,
      { cause: error }
    );
  }
};

/** Where each input's image goes, checked up front so no two inputs overwrite each other. */
const outputPaths = (
  inputs: readonly Input[],
  {
    out,
    outDir,
    extension
  }: { out?: string; outDir?: string; extension: string }
): string[] => {
  if (out !== undefined && outDir !== undefined) {
    throw new CliError(
      `${program} render was given both --out and --out-dir. --out names the file for a single input; --out-dir names a directory for any number. Pass one of them.`
    );
  }
  if (out !== undefined && inputs.length > 1) {
    throw new CliError(
      `${program} render was given ${String(inputs.length)} inputs and --out, which names a single file. Use --out-dir <dir> to write one image per input, named after each input.`
    );
  }
  const paths = inputs.map((input) => {
    if (out !== undefined) return resolve(out);
    const name =
      input.path === undefined
        ? `preview`
        : basename(input.path, extname(input.path));
    const directory =
      outDir ?? (input.path === undefined ? `.` : dirname(input.path));
    return resolve(directory, `${name}${extension}`);
  });
  const seen = new Map<string, string>();
  paths.forEach((path, index) => {
    const earlier = seen.get(path);
    if (earlier !== undefined) {
      throw new CliError(
        `${program} render would write the images for ${earlier} and ${inputs[index].name} to the same file, ${path}, because the inputs have the same name. Render them in separate runs with --out, or give the files different names.`
      );
    }
    seen.set(path, inputs[index].name);
  });
  return paths;
};

interface Entry {
  input: string;
  kind: RenderInputResult[`kind`];
  valid: boolean;
  /** Absolute path of the file written, or null when nothing could be drawn. */
  output: string | null;
  format: `png` | `html`;
  /** Size of the drawing in device pixels, or null when nothing was drawn. */
  width: number | null;
  height: number | null;
  findings: RenderInputResult[`findings`];
  counts: RenderInputResult[`counts`];
  fonts: NonNullable<RenderInputResult[`image`]>[`fonts`] | null;
}

const printEntry = (entry: Entry): void => {
  print(
    entry.output === null
      ? `${entry.input}: not drawn (${tally(entry.findings)})`
      : `${entry.input}: wrote ${entry.output} (${String(entry.width)}x${String(entry.height)}, ${tally(entry.findings)})`
  );
  printFindings(entry.findings);
  if (entry.fonts) {
    print(
      `  fonts: ${entry.fonts.used
        .map(
          (font) =>
            `${font.family} (${String(font.glyphs)}${font.system ? `, installed on this machine` : ``})`
        )
        .join(`, `)}`
    );
    if (entry.fonts.note !== undefined) print(`  note: ${entry.fonts.note}`);
  }
};

export const runRender = async (args: readonly string[]): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      out: { type: `string`, short: `o` },
      "out-dir": { type: `string` },
      html: { type: `boolean`, default: false },
      theme: { type: `string` },
      width: { type: `string` },
      scale: { type: `string` },
      now: { type: `string` },
      "time-zone": { type: `string` },
      locale: { type: `string` },
      "gg-sans": { type: `string` },
      cjk: { type: `string` },
      offline: { type: `boolean`, default: false },
      "cache-dir": { type: `string` },
      channel: { type: `string` },
      json: { type: `boolean`, default: false },
      help: { type: `boolean`, short: `h`, default: false }
    }
  });
  if (values.help) {
    print(renderUsage);
    return exitCodes.ok;
  }
  const scale = values.scale === undefined ? 1 : Number(values.scale);
  if (!Number.isFinite(scale) || scale <= 0 || scale > 4) {
    throw new CliError(
      `${program} cannot use \`--scale ${values.scale ?? ``}\`: it must be a number above 0 and at most 4, such as 2 for an image twice the size in each direction. Pass a number in that range.`
    );
  }
  const options = {
    theme: choiceOption(`theme`, values.theme, themes),
    width: integerOption(`width`, values.width, { min: 1, max: 4096 }),
    now: clockOption(`now`, `now`, values.now),
    timeZone: clockOption(`time-zone`, `timeZone`, values[`time-zone`]),
    locale: clockOption(`locale`, `locale`, values.locale),
    cjk: choiceOption(`cjk`, values.cjk, cjkFonts),
    ggSans: values[`gg-sans`],
    offline: values.offline,
    cacheDir:
      values[`cache-dir`] === undefined
        ? undefined
        : resolve(values[`cache-dir`]),
    scale,
    html: values.html
  };
  const inputs = await readInputs(positionals);
  const format = values.html ? `html` : `png`;
  const outputs = outputPaths(inputs, {
    out: values.out,
    outDir: values[`out-dir`],
    extension: `.${format}`
  });

  // Launching the browser is most of a single render's cost, so every input shares one, and none is launched when no input could be drawn.
  const drawable = inputs.some((input) => {
    const { scene, findings } = lint(input.text);
    return (
      scene !== undefined &&
      !findings.some((finding) => finding.code === `component-unsupported`)
    );
  });
  const browser = drawable ? await launchBrowser(values.channel) : undefined;
  const entries: Entry[] = [];
  try {
    for (const [index, input] of inputs.entries()) {
      const result = await render(input.text, { ...options, browser });
      let output: string | null = null;
      if (result.image) {
        output = outputs[index];
        await mkdir(dirname(output), { recursive: true });
        await writeFile(
          output,
          values.html ? (result.image.html ?? ``) : result.image.png
        );
      }
      const entry: Entry = {
        input: input.name,
        kind: result.kind,
        valid: result.valid,
        output,
        format,
        width: result.image?.width ?? null,
        height: result.image?.height ?? null,
        findings: result.findings,
        counts: result.counts,
        fonts: result.image?.fonts ?? null
      };
      entries.push(entry);
      if (!values.json) printEntry(entry);
    }
  } finally {
    await browser?.close();
  }
  if (values.json) printJson({ results: entries });
  return entries.some((entry) => !entry.valid || hasErrors(entry.findings))
    ? exitCodes.findings
    : exitCodes.ok;
};
