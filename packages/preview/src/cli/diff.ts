import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { defaultTolerance, diffImages } from "../node/diff.js";
import {
  CliError,
  exitCodes,
  integerOption,
  print,
  printJson,
  program
} from "./shared.js";

export const diffUsage = `Usage: ${program} diff <a.png> <b.png> [options]

Compares two PNGs pixel by pixel, aligned at their top-left corners, and writes a diff image: the first image faded to light grey with every differing pixel in red. Reports whether they match, how many pixels differ and what share that is, the box holding every difference, and whether the sizes match. Any PNG works, not only this tool's renders, such as a screenshot of the Discord client. No browser is needed.

Options:
  -o, --out <file>        Where to write the diff image. Default: beside
                          <a.png>, named <a>.diff.png.
      --tolerance <0-255> How far apart two pixels' colour channels may be and
                          still match. Default ${String(defaultTolerance)}: this tool draws the same
                          scene to the same bytes, so any difference between two
                          of its renders is real. Try 8 for an image from
                          another tool that may round colours differently.
      --json              Print one JSON document on standard output.
  -h, --help              Show this help.

Exit status: 0 the images match, 1 they differ, 2 could not run.`;

const readImage = async (name: string): Promise<Buffer> => {
  const path = resolve(name);
  try {
    return await readFile(path);
  } catch (error) {
    throw new CliError(
      `${program} diff could not read ${path}: ${error instanceof Error ? error.message : String(error)}. Relative paths are resolved against the working directory (${process.cwd()}). Check the path.`,
      { cause: error }
    );
  }
};

const percent = (ratio: number): string =>
  `${(ratio * 100).toFixed(ratio > 0 && ratio < 0.0001 ? 4 : 2)}%`;

export const runDiff = async (args: readonly string[]): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      out: { type: `string`, short: `o` },
      tolerance: { type: `string` },
      json: { type: `boolean`, default: false },
      help: { type: `boolean`, short: `h`, default: false }
    }
  });
  if (values.help) {
    print(diffUsage);
    return exitCodes.ok;
  }
  if (positionals.length !== 2) {
    throw new CliError(
      `${program} diff compares exactly two PNG files, and was given ${String(positionals.length)}. Run \`${program} diff <a.png> <b.png>\`.`
    );
  }
  const tolerance = integerOption(`tolerance`, values.tolerance, {
    min: 0,
    max: 255
  });
  const [a, b] = positionals;
  const [first, second] = await Promise.all([readImage(a), readImage(b)]);
  let result;
  try {
    result = diffImages(first, second, { tolerance });
  } catch (error) {
    throw new CliError(error instanceof Error ? error.message : String(error), {
      cause: error
    });
  }
  const output = resolve(
    values.out ??
      join(dirname(resolve(a)), `${basename(a, extname(a))}.diff.png`)
  );
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, result.diff);
  const { diff: _, a: sizeA, b: sizeB, ...rest } = result;
  if (values.json) {
    printJson({
      a: { path: resolve(a), ...sizeA },
      b: { path: resolve(b), ...sizeB },
      ...rest,
      output
    });
  } else {
    const box = result.box;
    print(
      result.identical
        ? `identical: ${a} and ${b} match (${String(sizeA.width)}x${String(sizeA.height)}, tolerance ${String(result.tolerance)})`
        : `different: ${String(result.differentPixels)} of ${String(result.totalPixels)} pixels (${percent(result.ratio)})${box ? ` in a ${String(box.width)}x${String(box.height)} box at ${String(box.x)},${String(box.y)}` : ``}`
    );
    if (!result.sameSize) {
      print(
        `  sizes differ: ${a} is ${String(sizeA.width)}x${String(sizeA.height)}, ${b} is ${String(sizeB.width)}x${String(sizeB.height)}; pixels only one image has count as different`
      );
    }
    print(`  diff image: ${output}`);
  }
  return result.identical ? exitCodes.ok : exitCodes.findings;
};
