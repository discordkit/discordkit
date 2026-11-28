import { runCodegen } from "./codegen.js";
import { runDevices } from "./devices.js";
import { runDiff } from "./diff.js";
import { runLint } from "./lint.js";
import { runRender } from "./render.js";
import { runStudio } from "./studio.js";
import {
  CliError,
  exitCodes,
  print,
  printJson,
  program,
  warn
} from "./shared.js";

export const usage = `Usage: ${program} <command> [options]

Draws Discord messages the way the Discord web client does, so you can see one without posting it. Inputs are JSON: a scene, a message payload, a modal, an array of components or one component, in snake_case or camelCase.

Commands:
  render [input...]   Draw each input to a PNG (or HTML with --html).
  lint [input...]     Check each input against Discord's schemas and limits.
  codegen [input]     Print TypeScript source for an input.
  diff <a> <b>        Compare two PNGs and write a diff image.
  devices             List the devices render --device can draw for.
  studio [scene.json] Open an editor on a scene file, with a live preview, that
                      you and an agent can work in at the same time.

Every command but devices and studio reads standard input when given no input file, and every command takes --json to print exactly one JSON document on standard output. Diagnostics go to standard error. Run \`${program} <command> --help\` for a command's options.

Exit status:
  0  It ran, and found nothing wrong (for diff: the images match).
  1  It ran, and an input has errors or could not be drawn (for diff: the
     images differ).
  2  It could not run: bad arguments, an unreadable file, no browser, or the
     package not built.

Previews follow Discord's published stylesheet but have not been calibrated against the live client. Not affiliated with Discord.`;

const commands: Record<string, (args: readonly string[]) => Promise<number>> = {
  render: runRender,
  lint: runLint,
  codegen: runCodegen,
  diff: runDiff,
  devices: runDevices,
  studio: runStudio
};

/** Whether `parseArgs` threw for the arguments themselves: an unknown option, a missing value. Node marks these with a code. */
const isArgumentError = (error: unknown): error is Error & { code: string } =>
  error instanceof Error &&
  `code` in error &&
  typeof error.code === `string` &&
  error.code.startsWith(`ERR_PARSE_ARGS_`);

/**
 * Runs the command line and resolves to the exit status. Never throws: a failure to run is printed (as JSON with `--json`) and becomes status 2.
 */
export const main = async (argv: readonly string[]): Promise<number> => {
  const json = argv.includes(`--json`);
  if (argv.length === 0) {
    warn(usage);
    return exitCodes.failed;
  }
  const [name, ...args] = argv;
  try {
    if (name === `--help` || name === `-h` || name === `help`) {
      print(usage);
      return exitCodes.ok;
    }
    const command = Object.hasOwn(commands, name) ? commands[name] : undefined;
    if (command === undefined) {
      throw new CliError(
        `${program} has no command called \`${name}\`. Its commands are render, lint, codegen, diff, devices and studio. Run \`${program} --help\` for what each does.`
      );
    }
    try {
      return await command(args);
    } catch (error) {
      if (isArgumentError(error)) {
        // Node's first sentence says what is wrong; the rest is advice about `--` that rarely applies here.
        const [problem = error.message] = error.message.split(/(?<=\.)\s/);
        throw new CliError(
          `${program} ${name} could not read its arguments: ${problem.replace(/\.?$/, `.`)} Run \`${program} ${name} --help\` for its options.`,
          { cause: error }
        );
      }
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (json) {
      printJson({ error: { message } });
    } else {
      warn(message);
    }
    // Errors this package raises explain themselves. Anything else is a bug, and its stack is what a report needs.
    const explained =
      error instanceof CliError ||
      (error instanceof Error &&
        error.message.startsWith(`@discordkit/preview`));
    if (!explained && error instanceof Error && error.stack !== undefined) {
      warn(error.stack);
    }
    return exitCodes.failed;
  }
};
