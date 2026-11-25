/**
 * A small pretty-printer for object literals, following the rules the repo's formatter (oxfmt, which follows Prettier) applies to them: 80 columns, two-space indent, no trailing commas, a group printed on one line when it fits and one entry per line when it does not, and an array of two or more multi-entry objects always one per line.
 */

/** Source text that is printed as is and never broken: a string, number or enum member. */
export interface Atom {
  kind: `atom`;
  text: string;
}

export interface ObjectDoc {
  kind: `object`;
  entries: Array<[key: string, value: Doc]>;
}

export interface ArrayDoc {
  kind: `array`;
  items: Doc[];
}

export type Doc = Atom | ObjectDoc | ArrayDoc;

export const width = 80;
const indentWidth = 2;

const entryCount = (doc: Doc): number =>
  doc.kind === `object`
    ? doc.entries.length
    : doc.kind === `array`
      ? doc.items.length
      : 0;

/** Prettier breaks an array of two or more objects (or of two or more arrays) when every one of them has more than one entry, whether or not it would fit. */
const forcedBreak = (doc: Doc): boolean => {
  if (doc.kind === `atom`) return false;
  if (doc.kind === `object`) {
    return doc.entries.some(([, value]) => forcedBreak(value));
  }
  const items = doc.items;
  const concise =
    items.length > 1 &&
    items.every((item) => item.kind === items[0].kind && entryCount(item) > 1);
  return concise || items.some(forcedBreak);
};

const flat = (doc: Doc): string => {
  switch (doc.kind) {
    case `atom`:
      return doc.text;
    case `object`:
      return doc.entries.length === 0
        ? `{}`
        : `{ ${doc.entries.map(([key, value]) => `${key}: ${flat(value)}`).join(`, `)} }`;
    case `array`:
      return `[${doc.items.map(flat).join(`, `)}]`;
  }
};

/**
 * Prints `doc` starting at column `column` on a line indented by `indent`, where `suffix` characters (a comma, a semicolon) follow it on the same line.
 */
export const print = (
  doc: Doc,
  indent: number,
  column: number,
  suffix: number
): string => {
  const oneLine = flat(doc);
  if (
    doc.kind === `atom` ||
    (!forcedBreak(doc) && column + oneLine.length + suffix <= width)
  ) {
    return oneLine;
  }
  const inner = indent + indentWidth;
  const pad = ` `.repeat(inner);
  const lines =
    doc.kind === `object`
      ? doc.entries.map(([key, value], index) => {
          const comma = index < doc.entries.length - 1 ? 1 : 0;
          const prefix = `${key}: `;
          return `${pad}${prefix}${print(value, inner, inner + prefix.length, comma)}${comma ? `,` : ``}`;
        })
      : doc.items.map((item, index) => {
          const comma = index < doc.items.length - 1 ? 1 : 0;
          return `${pad}${print(item, inner, inner, comma)}${comma ? `,` : ``}`;
        });
  const [open, close] = doc.kind === `object` ? [`{`, `}`] : [`[`, `]`];
  return `${open}\n${lines.join(`\n`)}\n${` `.repeat(indent)}${close}`;
};

/**
 * A JavaScript template literal whose value is exactly `text`, safe for any content: backslashes, backticks and `${` are escaped, newlines and other control characters become escapes, and a lone surrogate (which JSON can carry) becomes a `\u` escape. Emoji and other text stay as written.
 */
export const templateLiteral = (text: string): string => {
  let out = ``;
  for (let index = 0; index < text.length; index++) {
    const char = text.charAt(index);
    const code = text.charCodeAt(index);
    const next = text.charCodeAt(index + 1);
    if (char === `\\`) out += `\\\\`;
    else if (char === `\``) out += `\\\``;
    else if (char === `$` && text.charAt(index + 1) === `{`) out += `\\$`;
    else if (char === `\n`) out += `\\n`;
    else if (char === `\r`) out += `\\r`;
    else if (char === `\t`) out += `\\t`;
    else if (
      code >= 0xd800 &&
      code <= 0xdbff &&
      next >= 0xdc00 &&
      next <= 0xdfff
    ) {
      out += text.slice(index, index + 2);
      index++;
    } else if (
      code < 0x20 ||
      code === 0x7f ||
      code === 0x2028 ||
      code === 0x2029 ||
      (code >= 0xd800 && code <= 0xdfff)
    ) {
      out += `\\u${code.toString(16).padStart(4, `0`)}`;
    } else out += char;
  }
  return `\`${out}\``;
};

const identifier = /^[A-Za-z_$][\w$]*$/;

/** An object key as Prettier writes it with `quoteProps: "as-needed"`: bare when it is an identifier, double-quoted otherwise. */
export const propertyKey = (key: string): string =>
  identifier.test(key) ? key : JSON.stringify(key);
