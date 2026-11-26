/**
 * Writes a JSON value back over the text it was read from, changing only the text of what changed.
 *
 * Studio's form edits rewrite the scene file on every change. Printing the new value with `JSON.stringify` would reformat a hand-formatted file on the first keystroke: a row of buttons kept one to a line would spread over twenty lines, and the person's or agent's diff would be the whole file. Instead the old text is parsed with the position of every value, and the new value is printed against it:
 *
 * - a value equal to the old one keeps its old text exactly, and so does one that moved within its list or was copied (a reordered or duplicated component keeps its formatting);
 * - an object or array that changed keeps its brackets, line breaks, indentation and the spacing between its members, and only its changed members are printed again;
 * - a new value is printed in the style of its neighbours: on one line beside one-line siblings, otherwise over several lines, indented one step deeper than the line it starts on.
 *
 * Text that does not parse is replaced wholesale, as `JSON.stringify` would print it.
 */

interface Member {
  key: string;
  /** The key as written, quotes and escapes included. */
  keyText: string;
  keyStart: number;
  /** What sits between the key and its value: `: ` in most files. */
  colon: string;
  node: Node;
}

type Node =
  | {
      kind: `object`;
      start: number;
      end: number;
      value: unknown;
      members: Member[];
    }
  | { kind: `array`; start: number; end: number; value: unknown; items: Node[] }
  | { kind: `value`; start: number; end: number; value: unknown };

class Unparsable extends Error {}

const define = (
  target: Record<string, unknown>,
  key: string,
  value: unknown
): void => {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true
  });
};

/** JSON text as a tree of values with where each one starts and ends. Throws `Unparsable` for anything that is not JSON. */
const parse = (text: string): Node => {
  let index = 0;
  const space = (): void => {
    while (index < text.length && /\s/.test(text.charAt(index))) index++;
  };
  const expect = (char: string): void => {
    if (text.charAt(index) !== char) throw new Unparsable();
    index++;
  };
  const string = (): string => {
    const start = index;
    expect(`"`);
    while (index < text.length && text.charAt(index) !== `"`) {
      index += text.charAt(index) === `\\` ? 2 : 1;
    }
    expect(`"`);
    return text.slice(start, index);
  };
  const value = (): Node => {
    space();
    const start = index;
    const char = text.charAt(index);
    if (char === `{`) {
      index++;
      const members: Member[] = [];
      const out: Record<string, unknown> = {};
      space();
      if (text.charAt(index) === `}`) {
        index++;
        return { kind: `object`, start, end: index, value: out, members };
      }
      for (;;) {
        space();
        const keyStart = index;
        const keyText = string();
        const key: unknown = JSON.parse(keyText);
        if (typeof key !== `string`) throw new Unparsable();
        const colonStart = index;
        space();
        expect(`:`);
        const node = value();
        members.push({
          key,
          keyText,
          keyStart,
          colon: text.slice(colonStart, node.start),
          node
        });
        define(out, key, node.value);
        space();
        if (text.charAt(index) === `}`) {
          index++;
          break;
        }
        expect(`,`);
      }
      return { kind: `object`, start, end: index, value: out, members };
    }
    if (char === `[`) {
      index++;
      const items: Node[] = [];
      space();
      if (text.charAt(index) === `]`) {
        index++;
        return { kind: `array`, start, end: index, value: [], items };
      }
      for (;;) {
        items.push(value());
        space();
        if (text.charAt(index) === `]`) {
          index++;
          break;
        }
        expect(`,`);
      }
      return {
        kind: `array`,
        start,
        end: index,
        value: items.map((item) => item.value),
        items
      };
    }
    if (char === `"`) {
      const literal = string();
      return { kind: `value`, start, end: index, value: JSON.parse(literal) };
    }
    const literal =
      /^(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(
        text.slice(index)
      );
    if (literal === null) throw new Unparsable();
    index += literal[0].length;
    return {
      kind: `value`,
      start,
      end: index,
      value: JSON.parse(literal[0]) as unknown
    };
  };
  const root = value();
  space();
  if (index !== text.length) throw new Unparsable();
  return root;
};

const isContainer = (value: unknown): value is object =>
  typeof value === `object` && value !== null;

const defined = (value: object): Array<[string, unknown]> =>
  Object.entries(value).filter(([, item]) => item !== undefined);

/** Equal as JSON: the same keys in the same order with equal values, an `undefined` key counting as absent. */
const equal = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => equal(item, b[index]))
    );
  }
  if (!isContainer(a) || !isContainer(b)) return false;
  const left = defined(a);
  const right = defined(b);
  return (
    left.length === right.length &&
    left.every(
      ([key, item], index) =>
        right[index][0] === key && equal(item, right[index][1])
    )
  );
};

/** The whitespace at the start of the line `position` is on. */
const lineIndent = (text: string, position: number): string => {
  const lineStart = text.lastIndexOf(`\n`, position - 1) + 1;
  return /^[ \t]*/.exec(text.slice(lineStart))?.[0] ?? ``;
};

/** A value on one line, spaced as people write JSON by hand: `{ "type": 2, "label": "1" }`. */
const oneLine = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.length === 0 ? `[]` : `[${value.map(oneLine).join(`, `)}]`;
  }
  if (isContainer(value)) {
    const entries = defined(value);
    return entries.length === 0
      ? `{}`
      : `{ ${entries.map(([key, item]) => `${JSON.stringify(key)}: ${oneLine(item)}`).join(`, `)} }`;
  }
  return value === undefined ? `null` : JSON.stringify(value);
};

/**
 * `value` as JSON text, printed over `oldText` so that only what changed is written differently. `indent` is the file's indentation per level, used for values that are new, or `0` for a file kept on one line.
 */
export const preserveFormat = (
  oldText: string,
  value: unknown,
  indent: string | 0
): string => {
  let root: Node;
  try {
    root = parse(oldText);
  } catch {
    return `${JSON.stringify(value, null, indent === 0 ? 2 : indent)}\n`;
  }
  const sourceOf = (node: Node): string => oldText.slice(node.start, node.end);
  // Between two items of a list that had one item on one line: a space, unless the file has no spaces at all.
  const oneLineGap = indent === 0 ? `` : ` `;

  const fresh = (item: unknown, base: string, compact: boolean): string => {
    if (indent === 0) return JSON.stringify(item);
    if (compact) return oneLine(item);
    return JSON.stringify(item, null, indent).replace(/\n/g, `\n${base}`);
  };

  // Every old object and array, so an unchanged one that moved or was copied keeps its text.
  const pool: Node[] = [];
  const collect = (node: Node): void => {
    if (node.kind === `value`) return;
    pool.push(node);
    if (node.kind === `object`)
      for (const member of node.members) collect(member.node);
    else for (const item of node.items) collect(item);
  };
  collect(root);
  /** An old node equal to `item` whose text fits where it is going: on one line, or from a line indented the same. */
  const found = (item: unknown, base: string): Node | undefined =>
    pool.find(
      (node) =>
        equal(node.value, item) &&
        (!sourceOf(node).includes(`\n`) ||
          lineIndent(oldText, node.start) === base)
    );

  const print = (
    item: unknown,
    node: Node | undefined,
    base: string,
    compact: boolean
  ): string => {
    if (node !== undefined && equal(node.value, item)) return sourceOf(node);
    if (!isContainer(item)) return oneLine(item);
    const moved = found(item, base);
    if (moved !== undefined) return sourceOf(moved);

    if (
      Array.isArray(item) &&
      node?.kind === `array` &&
      node.items.length > 0
    ) {
      const { items } = node;
      const first = items[0];
      const open = oldText.slice(node.start + 1, first.start);
      const close = oldText.slice((items.at(-1) ?? first).end, node.end - 1);
      const separator =
        items.length > 1
          ? oldText.slice(oldText.indexOf(`,`, first.end) + 1, items[1].start)
          : open.includes(`\n`)
            ? open
            : oneLineGap;
      const itemBase = lineIndent(oldText, first.start);
      const oneLineItems = items.every((old) => !sourceOf(old).includes(`\n`));
      if (item.length === 0) return `[]`;
      return `[${open}${item
        .map((next: unknown, position) =>
          print(next, items.at(position), itemBase, oneLineItems)
        )
        .join(`,${separator}`)}${close}]`;
    }

    if (
      !Array.isArray(item) &&
      node?.kind === `object` &&
      node.members.length > 0
    ) {
      const { members } = node;
      const first = members[0];
      const open = oldText.slice(node.start + 1, first.keyStart);
      const close = oldText.slice(
        (members.at(-1) ?? first).node.end,
        node.end - 1
      );
      const separator =
        members.length > 1
          ? oldText.slice(
              oldText.indexOf(`,`, first.node.end) + 1,
              members[1].keyStart
            )
          : open.includes(`\n`)
            ? open
            : oneLineGap;
      const memberBase = lineIndent(oldText, first.keyStart);
      const oneLineObject = !sourceOf(node).includes(`\n`);
      const printed = defined(item).map(([key, next]) => {
        const old = members.find((member) => member.key === key);
        return old === undefined
          ? `${JSON.stringify(key)}${first.colon}${fresh(next, memberBase, oneLineObject)}`
          : `${old.keyText}${old.colon}${print(next, old.node, memberBase, oneLineObject)}`;
      });
      if (printed.length === 0) return `{}`;
      return `{${open}${printed.join(`,${separator}`)}${close}}`;
    }

    // A new object or array, a value that changed kind, or one that was empty: printed afresh.
    return fresh(item, base, compact);
  };

  return `${oldText.slice(0, root.start)}${print(value, root, ``, false)}${oldText.slice(root.end)}`;
};
