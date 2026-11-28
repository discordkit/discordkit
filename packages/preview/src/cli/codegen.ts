import { parseArgs } from "node:util";
import { codegen, type CodegenShape } from "../codegen/index.js";
import { hasErrors } from "../findings.js";
import {
  choiceOption,
  CliError,
  exitCodes,
  print,
  printFindings,
  printJson,
  program,
  readInputs,
  tally,
  warn
} from "./shared.js";

export const codegenUsage = `Usage: ${program} codegen [input] [options]

Prints TypeScript source for one input: a constant typed with @discordkit/client, using ComponentType, ButtonStyle and MessageFlag members, hex colours and backtick strings. Components become a MessageComponent; a message payload or a scene becomes one MessagesCallbackData per message; a modal, or a scene's modal, becomes a ModalCallbackData. The input is a JSON file in snake_case or camelCase; with none, or \`-\`, it reads standard input.

The source goes to standard output and any findings to standard error. Source is still printed when the input has errors, but may not compile then.

Options:
      --shape <shape>   components, embeds, message or modal. Default:
                        components for components, modal for a modal,
                        message for a payload or a scene (with its modal).
      --name <name>     The constant's name. Default: the shape's name.
      --json            Print one JSON document on standard output.
  -h, --help            Show this help.

Exit status: 0 no errors, 1 the input has errors, 2 could not run.`;

const shapes: readonly CodegenShape[] = [
  `components`,
  `embeds`,
  `message`,
  `modal`
];

export const runCodegen = async (args: readonly string[]): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: [...args],
    allowPositionals: true,
    options: {
      shape: { type: `string` },
      name: { type: `string` },
      json: { type: `boolean`, default: false },
      help: { type: `boolean`, short: `h`, default: false }
    }
  });
  if (values.help) {
    print(codegenUsage);
    return exitCodes.ok;
  }
  if (positionals.length > 1) {
    throw new CliError(
      `${program} codegen takes one input, and was given ${String(positionals.length)}. It prints one module of source. Run it once per input.`
    );
  }
  const shape = choiceOption(`shape`, values.shape, shapes);
  if (values.name !== undefined && !/^[A-Za-z_$][\w$]*$/.test(values.name)) {
    throw new CliError(
      `${program} cannot use \`--name ${values.name}\`: the constant's name has to be a JavaScript identifier (letters, digits, \`_\` and \`$\`, not starting with a digit). Pass a name like \`questionCard\`.`
    );
  }
  const [input] = await readInputs(positionals);
  const { kind, source, findings } = codegen(input.text, {
    shape,
    name: values.name
  });
  const valid = !hasErrors(findings);
  if (values.json) {
    printJson({
      input: input.name,
      kind,
      valid,
      source: source ?? null,
      findings
    });
  } else {
    if (source !== undefined) process.stdout.write(source);
    if (findings.length > 0) {
      warn(`${input.name}: ${tally(findings)}`);
      printFindings(findings, warn);
    }
  }
  return valid ? exitCodes.ok : exitCodes.findings;
};
