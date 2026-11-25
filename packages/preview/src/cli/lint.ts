import { parseArgs } from "node:util";
import { lint } from "../lint/index.js";
import {
  exitCodes,
  print,
  printCounts,
  printFindings,
  printJson,
  program,
  readInputs,
  tally
} from "./shared.js";

export const lintUsage = `Usage: ${program} lint [input...] [options]

Checks each input against @discordkit/client's schemas and Discord's limits and rules, and reports every finding with a path into the input, plus how much of each limit is used. No browser is needed. An input is a JSON file holding a scene, a message payload, an array of components or one component, in snake_case or camelCase. With no input, or \`-\`, it reads standard input.

Options:
      --json      Print one JSON document on standard output.
  -h, --help      Show this help.

Exit status: 0 no errors (warnings allowed), 1 an input has errors, 2 could not run.`;

export const runLint = async (args: readonly string[]): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      json: { type: `boolean`, default: false },
      help: { type: `boolean`, short: `h`, default: false }
    }
  });
  if (values.help) {
    print(lintUsage);
    return exitCodes.ok;
  }
  const inputs = await readInputs(positionals);
  const results = inputs.map((input) => {
    const { kind, valid, findings, counts } = lint(input.text);
    return { input: input.name, kind, valid, findings, counts };
  });
  if (values.json) {
    printJson({ results });
  } else {
    for (const result of results) {
      print(
        `${result.input}: ${result.valid ? `valid` : `invalid`} (${tally(result.findings)})`
      );
      printFindings(result.findings);
      printCounts(result.counts);
    }
  }
  return results.every((result) => result.valid)
    ? exitCodes.ok
    : exitCodes.findings;
};
