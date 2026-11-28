import { spawn } from "node:child_process";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  startStudioServer,
  StudioServerError,
  preferredPort
} from "../bridge/server.js";
import {
  CliError,
  exitCodes,
  integerOption,
  print,
  printJson,
  program,
  warn
} from "./shared.js";

export const studioUsage = `Usage: ${program} studio [scene.json] [options]

Opens Studio, an editor for a scene file with a live preview, the file's findings, and the TypeScript for it. Studio and anything else that edits the file (a coding agent, your editor, a spec regenerating it) work on it together: edits in the browser are written to the file, and changes to the file appear in the browser within a second. Studio never overwrites a change it has not seen.

The file can hold anything the other commands read: a scene, a message payload, an array of components or one component, in snake_case or camelCase. Studio keeps it in that shape and key style when it saves. With no file, Studio keeps a draft in the browser's storage, with import and export.

It serves Studio on 127.0.0.1 only, at an address carrying a secret that changes every run, and runs until you stop it with Ctrl+C.

Options:
      --port <n>     Port to listen on. Default: ${String(preferredPort)} when it is free, otherwise any
                     free port. A port given here that is in use is an error.
      --open         Open the address in your browser. The default when the
                     command runs in a terminal.
      --no-open      Do not open a browser. The default when the output is
                     piped or --json is given, as when an agent runs it.
      --json         Print one JSON document on standard output once Studio is
                     ready: { "url", "port", "file", "opened" }.
      --channel <name>
                     The installed browser Studio's PNG export drives (chrome,
                     msedge, …), as render --channel takes it. Default:
                     Playwright's Chromium.
  -h, --help         Show this help.

Exit status: 0 stopped with Ctrl+C, 2 could not start.`;

/** Studio's built web app, beside this module in the package's dist. */
const staticDir = fileURLToPath(new URL(`../studio/`, import.meta.url));

/** Opens a URL in the default browser with the platform's own launcher. Resolves to whether the launcher started. */
const openBrowser = async (url: string): Promise<boolean> => {
  // rundll32 hands the URL to Windows's default handler without going through cmd.exe, whose quoting would need escaping.
  const [command, args]: [string, string[]] =
    process.platform === `win32`
      ? [`rundll32`, [`url.dll,FileProtocolHandler`, url]]
      : process.platform === `darwin`
        ? [`open`, [url]]
        : [`xdg-open`, [url]];
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: `ignore`, detached: true });
    child.once(`error`, () => resolve(false));
    child.once(`spawn`, () => {
      child.unref();
      resolve(true);
    });
  });
};

/** Resolves when the person stops the command: Ctrl+C, or a terminating signal from whatever started it. */
const interrupted = async (): Promise<void> =>
  new Promise((resolve) => {
    const stop = (): void => {
      process.off(`SIGINT`, stop);
      process.off(`SIGTERM`, stop);
      process.off(`SIGHUP`, stop);
      resolve();
    };
    process.on(`SIGINT`, stop);
    process.on(`SIGTERM`, stop);
    process.on(`SIGHUP`, stop);
  });

export const runStudio = async (args: readonly string[]): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      port: { type: `string` },
      open: { type: `boolean`, default: false },
      "no-open": { type: `boolean`, default: false },
      json: { type: `boolean`, default: false },
      channel: { type: `string` },
      help: { type: `boolean`, short: `h`, default: false }
    }
  });
  if (values.help) {
    print(studioUsage);
    return exitCodes.ok;
  }
  if (positionals.length > 1) {
    throw new CliError(
      `${program} studio edits one file at a time, and was given ${String(positionals.length)}: ${positionals.join(`, `)}. Name one scene file, or run one Studio per file.`
    );
  }
  if (positionals[0] === `-`) {
    throw new CliError(
      `${program} studio cannot edit standard input, because it writes its changes back to the file it reads. Name a scene file, or run it with no file to keep a draft in the browser.`
    );
  }
  if (values.open && values[`no-open`]) {
    throw new CliError(
      `${program} studio was given both --open and --no-open. Pass one of them, or neither to open a browser only when run in a terminal.`
    );
  }
  const port = integerOption(`port`, values.port, { min: 0, max: 65535 });
  const named = positionals.at(0);
  const file = named === undefined ? undefined : resolvePath(named);

  let server;
  try {
    server = await startStudioServer({
      file,
      staticDir,
      port,
      channel: values.channel
    });
  } catch (error) {
    if (error instanceof StudioServerError) {
      throw new CliError(error.message, { cause: error });
    }
    throw error;
  }

  const open =
    values.open ||
    (!values[`no-open`] &&
      !values.json &&
      process.stdout.isTTY &&
      process.env.CI === undefined);
  const opened = open ? await openBrowser(server.url) : false;

  if (values.json) {
    printJson({
      url: server.url,
      port: server.port,
      file: file ?? null,
      opened
    });
  } else {
    print(
      file === undefined
        ? `Studio is running with no file, keeping a draft in the browser.`
        : `Studio is editing ${file}`
    );
    print(`  ${server.url}`);
    print();
    if (file !== undefined) {
      print(
        `  Edits in the browser are written to the file, and changes to the file appear in the browser.`
      );
    }
    print(
      `  The address carries a secret for this run. Anyone with it can ${file === undefined ? `use this Studio` : `change the file`}, so do not share it.`
    );
    print(`  Press Ctrl+C to stop.`);
  }
  if (open && !opened) {
    warn(
      `${program} studio could not open a browser on this machine, so open the address above yourself.`
    );
  }

  await interrupted();
  await server.close();
  if (!values.json) warn(`Studio stopped.`);
  return exitCodes.ok;
};
