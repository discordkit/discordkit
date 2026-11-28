import { isObject } from "@discordkit/core/utils/isObject";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { TextInputStyle } from "@discordkit/client/components/types/TextInputStyle";
import { EmbedType } from "@discordkit/client/messages/types/EmbedType";
import { MessageFlag } from "@discordkit/client/messages/types/MessageFlag";
import type { Finding } from "../findings.js";
import { intake, type InputKind } from "../scene/intake.js";
import {
  print,
  propertyKey,
  templateLiteral,
  width,
  type Doc
} from "./print.js";

export { templateLiteral } from "./print.js";
export type { Finding } from "../findings.js";

/** What the generated declaration holds, and so which `@discordkit/client` type it is annotated with. `modal` is a modal's callback data: what a bot passes as `data` when it answers an interaction with a `MODAL` response. */
export type CodegenShape = `components` | `embeds` | `message` | `modal`;

export interface CodegenOptions {
  /** Defaults to `components` for components, `modal` for a modal, and `message` for a message body or a scene (whose modal, when it has one, follows its messages as a `ModalCallbackData`). */
  shape?: CodegenShape;
  /** The declared constant's name. Defaults to the shape's name; with several messages, each gets its number after it (`message1`, `message2`). */
  name?: string;
}

export interface CodegenResult {
  kind: InputKind;
  /** TypeScript source, or absent when the input could not be read at all. Generated even when `findings` holds errors, so it may not compile then. */
  source?: string;
  /** Intake's findings, with paths into the input as the caller wrote it. */
  findings: Finding[];
}

const shapeTypes: Record<CodegenShape, string> = {
  components: `MessageComponent`,
  embeds: `Embed[]`,
  message: `MessagesCallbackData`,
  modal: `ModalCallbackData`
};

const client = `@discordkit/client`;

/** The enums whose members replace numbers, and what each is called in an import. */
interface Enums {
  used: Set<string>;
}

/** `Name.Member` for an enum value, or undefined when the enum has no member with that value. Records the import. */
const member = (
  enums: Enums,
  name: string,
  values: Record<string, string | number>,
  value: unknown
): string | undefined => {
  const key = Object.keys(values).find(
    (candidate) =>
      Number.isNaN(Number(candidate)) && values[candidate] === value
  );
  if (key === undefined) return undefined;
  enums.used.add(name);
  return `${name}.${key}`;
};

/** A message's flags as `MessageFlag` members joined with `|`, lowest bit first, with any bit Discord does not name kept as a number. */
const flagsSource = (enums: Enums, flags: number): string | undefined => {
  if (!Number.isInteger(flags) || flags <= 0) return undefined;
  const parts: string[] = [];
  let rest = flags;
  for (let bit = 0; bit < 31; bit++) {
    const value = 2 ** bit;
    if ((rest & value) === 0) continue;
    const named = member(enums, `MessageFlag`, MessageFlag, value);
    if (named !== undefined) {
      parts.push(named);
      rest -= value;
    }
  }
  if (rest !== 0) parts.push(String(rest));
  return parts.join(` | `);
};

const hex = (value: number): string =>
  `0x${value.toString(16).padStart(6, `0`)}`;

const isColor = (value: unknown): value is number =>
  typeof value === `number` &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 0xffffff;

const atom = (text: string): Doc => ({ kind: `atom`, text });

type Place = `component` | `embed` | `message` | `other`;

/** Turns a camelCase payload value into a printable document, writing enum members, hex colours and template literals where the bots' own code does. */
const toDoc = (value: unknown, place: Place, enums: Enums): Doc => {
  if (typeof value === `string`) return atom(templateLiteral(value));
  if (typeof value === `number`) {
    return atom(Object.is(value, -0) ? `-0` : String(value));
  }
  if (typeof value === `boolean` || value === null) {
    return atom(String(value));
  }
  if (Array.isArray(value)) {
    return {
      kind: `array`,
      items: value.map((item: unknown) =>
        item === undefined ? atom(`undefined`) : toDoc(item, place, enums)
      )
    };
  }
  if (!isObject(value)) return atom(`undefined`);
  const component = place === `component` && typeof value.type === `number`;
  const entries: Array<[string, Doc]> = [];
  for (const [key, item] of Object.entries(value)) {
    if (item === undefined) continue;
    let special: string | undefined;
    if (component && key === `type`) {
      special = member(enums, `ComponentType`, ComponentType, item);
    } else if (component && key === `style`) {
      special =
        value.type === ComponentType.Button
          ? member(enums, `ButtonStyle`, ButtonStyle, item)
          : value.type === ComponentType.TextInput
            ? member(enums, `TextInputStyle`, TextInputStyle, item)
            : undefined;
    } else if (component && key === `accentColor` && isColor(item)) {
      special = hex(item);
    } else if (place === `embed` && key === `color` && isColor(item)) {
      special = hex(item);
    } else if (place === `embed` && key === `type`) {
      special = member(enums, `EmbedType`, EmbedType, item);
    } else if (place === `message` && key === `flags`) {
      special = typeof item === `number` ? flagsSource(enums, item) : undefined;
    }
    const childPlace: Place =
      key === `components` || key === `accessory` || key === `component`
        ? `component`
        : key === `embeds`
          ? `embed`
          : // An embed's nested objects (author, footer, fields) are not embeds; a component's nested objects (media, emoji) are not components.
            `other`;
    entries.push([
      propertyKey(key),
      special === undefined ? toDoc(item, childPlace, enums) : atom(special)
    ]);
  }
  return { kind: `object`, entries };
};

const importLine = (values: string[], types: string[]): string => {
  const names = [...values, ...types.map((type) => `type ${type}`)].sort(
    (a, b) =>
      a.replace(/^type /, ``).localeCompare(b.replace(/^type /, ``), `en`)
  );
  if (values.length === 0) {
    return `import type { ${types.join(`, `)} } from "${client}";`;
  }
  const line = `import { ${names.join(`, `)} } from "${client}";`;
  return line.length <= width
    ? line
    : `import {\n${names.map((name) => `  ${name}`).join(`,\n`)}\n} from "${client}";`;
};

const declaration = (name: string, type: string, doc: Doc): string => {
  const head = `export const ${name}: ${type} = `;
  return `${head}${print(doc, 0, head.length, 1)};`;
};

/**
 * TypeScript source declaring `value` as a constant typed with @discordkit/client, in the style Inbou and Tome write messages by hand: a plain object literal, `ComponentType`, `ButtonStyle` and `MessageFlag` members in place of numbers, colours in hex, and backtick strings. The same value always gives the same text.
 *
 * `value` is in camelCase, as `readScene` returns it: a message's components for the `components` shape, its embeds for `embeds`, or the message body for `message`.
 */
export const toSource = (
  values: readonly unknown[],
  shape: CodegenShape,
  name: string = shape,
  /** A modal to declare after the values, as `modal` typed `ModalCallbackData`: a scene's modal beside its messages. */
  modal?: unknown
): string => {
  const enums: Enums = { used: new Set() };
  const place: Place =
    shape === `components`
      ? `component`
      : shape === `embeds`
        ? `embed`
        : // A modal's own keys are its `customId`, `title` and `components`, like a message body's: only `components` holds components.
          `message`;
  const declarations = values.map((value, index) =>
    declaration(
      values.length === 1 ? name : `${name}${String(index + 1)}`,
      shapeTypes[shape],
      toDoc(value, place, enums)
    )
  );
  const types = [shapeTypes[shape].replace(`[]`, ``)];
  if (modal !== undefined) {
    declarations.push(
      declaration(`modal`, shapeTypes.modal, toDoc(modal, `message`, enums))
    );
    types.push(shapeTypes.modal);
  }
  return `${importLine([...enums.used], types)}\n\n${declarations.join(`\n\n`)}\n`;
};

/**
 * Reads anything `readScene` accepts and prints it as TypeScript source that compiles against @discordkit/client and evaluates back to the normalised payload. Components (or one component) become `MessageComponent`; a message body or a scene becomes one `MessagesCallbackData` per message.
 *
 * @example
 * const { source, findings } = codegen(snakeCasePayload);
 */
export const codegen = (
  input: unknown,
  options: CodegenOptions = {}
): CodegenResult => {
  const read = intake(input);
  if (read.scene === undefined) {
    return { kind: read.kind, findings: read.findings };
  }
  const shape: CodegenShape =
    options.shape ??
    (read.kind === `components` || read.kind === `component`
      ? `components`
      : read.kind === `modal`
        ? `modal`
        : `message`);
  const modal =
    isObject(read.scene.modal) && isObject(read.scene.modal.payload)
      ? read.scene.modal.payload
      : undefined;
  if (shape === `modal`) {
    return {
      kind: read.kind,
      source: toSource(modal === undefined ? [] : [modal], shape, options.name),
      findings: read.findings
    };
  }
  const payloads = read.scene.messages.map((message) =>
    isObject(message) && isObject(message.payload) ? message.payload : {}
  );
  const values = payloads.map((payload) =>
    shape === `components`
      ? (payload.components ?? [])
      : shape === `embeds`
        ? (payload.embeds ?? [])
        : payload
  );
  return {
    kind: read.kind,
    source: toSource(
      values,
      shape,
      options.name,
      shape === `message` ? modal : undefined
    ),
    findings: read.findings
  };
};
