import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { formatPath, type Finding } from "../findings.js";
import type { Count } from "../lint/index.js";

/** The command's name, as a person types it. */
export const program = `discordkit-preview`;

/**
 * How a run ended, as its exit status:
 *
 * - `ok` (0): it ran, and found nothing wrong (warnings allowed); for `diff`, the images match.
 * - `findings` (1): it ran, and the message has errors (or could not be drawn); for `diff`, the images differ.
 * - `failed` (2): it could not run: bad arguments, an unreadable file, no browser, or the package not built.
 */
export const exitCodes = { ok: 0, findings: 1, failed: 2 } as const;

/** A failure to run, with a message that says what happened, why and what to do. Printed without a stack trace. */
export class CliError extends Error {
  override name = `CliError`;
}

/** Standard input, or the files named, read as text. A leading byte-order mark is dropped, since Windows tools add one and JSON does not allow it. */
export interface Input {
  /** As the caller named it, or `<stdin>`. */
  name: string;
  /** The file's absolute path, or undefined for standard input. */
  path?: string;
  text: string;
}

export const stdinName = `<stdin>`;

const stripBom = (text: string): string =>
  text.startsWith(`﻿`) ? text.slice(1) : text;

const readStdin = async (): Promise<string> => {
  if (process.stdin.isTTY) {
    throw new CliError(
      `${program} was given no input file and nothing is being piped to it, so it has nothing to read. Name a JSON file (a scene, a message payload or components), or pipe one in, for example \`${program} lint < message.json\`.`
    );
  }
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString(`utf8`);
};

/** Reads every input before any work starts, so a mistyped path fails the run at once instead of after the inputs before it were processed. `-`, or no names at all, means standard input. */
export const readInputs = async (
  names: readonly string[]
): Promise<Input[]> => {
  const given = names.length === 0 ? [`-`] : names;
  if (given.filter((name) => name === `-`).length > 1) {
    throw new CliError(
      `${program} was told to read standard input more than once (\`-\` appears twice), but it can be read only once. Pass \`-\` at most once, and name the other inputs as files.`
    );
  }
  return Promise.all(
    given.map(async (name): Promise<Input> => {
      if (name === `-`)
        return { name: stdinName, text: stripBom(await readStdin()) };
      const path = resolve(name);
      try {
        return { name, path, text: stripBom(await readFile(path, `utf8`)) };
      } catch (error) {
        throw new CliError(
          `${program} could not read ${path}: ${error instanceof Error ? error.message : String(error)}. Relative paths are resolved against the working directory (${process.cwd()}). Check the path, or pipe the JSON in on standard input instead.`,
          { cause: error }
        );
      }
    })
  );
};

/** Writes one JSON document to standard output, the only thing written there with `--json`. */
export const printJson = (value: unknown): void => {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
};

export const print = (line = ``): void => {
  process.stdout.write(`${line}\n`);
};

/** Diagnostics: always standard error, so they never mix into JSON. */
export const warn = (line: string): void => {
  process.stderr.write(`${line}\n`);
};

const plural = (count: number, word: string): string =>
  `${String(count)} ${word}${count === 1 ? `` : `s`}`;

export const tally = (findings: readonly Finding[]): string => {
  const errors = findings.filter(
    (finding) => finding.severity === `error`
  ).length;
  return `${plural(errors, `error`)}, ${plural(findings.length - errors, `warning`)}`;
};

/** Findings for a person: severity, code and where, then the message, indented under it. */
export const printFindings = (
  findings: readonly Finding[],
  write: (line: string) => void = print
): void => {
  for (const finding of findings) {
    const path = formatPath(finding.path);
    const where =
      path === `` ? (finding.asset ?? `(the input as a whole)`) : path;
    write(`  ${finding.severity.padEnd(7)} ${finding.code}  ${where}`);
    write(`          ${finding.message}`);
  }
};

export const printCounts = (counts: readonly Count[]): void => {
  for (const count of counts) {
    const where = formatPath(count.path);
    print(`  ${count.summary}${where === `` ? `` : `  (${where})`}`);
  }
};

/** Parses a whole number option, or fails the run naming the option. */
export const integerOption = (
  name: string,
  value: string | undefined,
  { min, max }: { min: number; max: number }
): number | undefined => {
  if (value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new CliError(
      `${program} cannot use \`--${name} ${value}\`: it must be a whole number from ${String(min)} to ${String(max)}. Pass a number in that range.`
    );
  }
  return number;
};

export const choiceOption = <T extends string>(
  name: string,
  value: string | undefined,
  choices: readonly T[]
): T | undefined => {
  if (value === undefined) return undefined;
  const choice = choices.find((candidate) => candidate === value);
  if (choice === undefined) {
    throw new CliError(
      `${program} does not know \`--${name} ${value}\`. It takes one of: ${choices.join(`, `)}. Pass one of those.`
    );
  }
  return choice;
};
