/** Where JSON text stops being valid, and what was expected there. */
export interface JsonError {
  /** What is wrong, in a sentence. */
  message: string;
  /** Offset into the text, in UTF-16 units, where the problem is. */
  offset: number;
  /** 1-based, for showing. */
  line: number;
  column: number;
}

class Stop extends Error {
  constructor(
    readonly offset: number,
    message: string
  ) {
    super(message);
  }
}

const describe = (text: string, offset: number): string => {
  if (offset >= text.length) return `the end of the text`;
  const char = text.charAt(offset);
  if (char === `\n` || char === `\r`) return `a line break`;
  if (char === `'`) return `a single quote (JSON strings need double quotes)`;
  return `\`${char}\``;
};

/**
 * Finds the first place JSON text is invalid and says what was expected there. Browsers' own `JSON.parse` messages differ, and some give no position, so the editor finds it itself: a small recursive-descent reader of the JSON grammar that stops at the first problem.
 *
 * Returns undefined for valid JSON.
 */
export const findJsonError = (text: string): JsonError | undefined => {
  let index = 0;
  const fail = (expected: string): never => {
    throw new Stop(
      index,
      `Expected ${expected}, but found ${describe(text, index)}.`
    );
  };
  const space = (): void => {
    while (/[ \t\n\r]/.test(text.charAt(index))) index++;
  };
  const literal = (word: string): void => {
    for (const char of word) {
      if (text.charAt(index) !== char) fail(`\`${word}\``);
      index++;
    }
  };
  const string = (): void => {
    if (text.charAt(index) !== `"`) fail(`a double-quoted string`);
    index++;
    for (;;) {
      if (index >= text.length) {
        throw new Stop(
          index,
          `This string is never closed: add a \`"\` where it should end.`
        );
      }
      const char = text.charAt(index);
      if (char === `"`) {
        index++;
        return;
      }
      if (char === `\n` || char === `\r`) {
        throw new Stop(
          index,
          `A string cannot run onto the next line. Close it with \`"\` first, or write the line break as \`\\n\`.`
        );
      }
      if (char < ` `) {
        throw new Stop(
          index,
          `A string cannot hold a raw control character; write it as an escape such as \`\\t\`.`
        );
      }
      if (char === `\\`) {
        index++;
        const escape = text.charAt(index);
        if (escape === `u`) {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(index + 1, index + 5))) {
            throw new Stop(
              index,
              `\`\\u\` must be followed by four hexadecimal digits.`
            );
          }
          index += 5;
          continue;
        }
        if (!`"\\/bfnrt`.includes(escape) || escape === ``) {
          throw new Stop(
            index,
            `\`\\${escape}\` is not an escape JSON knows. Write a backslash as \`\\\\\`.`
          );
        }
      }
      index++;
    }
  };
  const number = (): void => {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(
      text.slice(index)
    );
    if (match === null || match[0] === `` || match[0] === `-`) fail(`a value`);
    index += match?.[0].length ?? 0;
  };
  const value = (): void => {
    space();
    const char = text.charAt(index);
    if (char === `{`) {
      index++;
      space();
      if (text.charAt(index) === `}`) {
        index++;
        return;
      }
      for (;;) {
        space();
        if (text.charAt(index) === `}`) {
          throw new Stop(
            index,
            `A comma before \`}\` is not allowed in JSON. Remove the trailing comma.`
          );
        }
        string();
        space();
        if (text.charAt(index) !== `:`) fail(`\`:\` after the key`);
        index++;
        value();
        space();
        if (text.charAt(index) === `,`) {
          index++;
          continue;
        }
        if (text.charAt(index) === `}`) {
          index++;
          return;
        }
        fail(`\`,\` or \`}\` after the value`);
      }
    }
    if (char === `[`) {
      index++;
      space();
      if (text.charAt(index) === `]`) {
        index++;
        return;
      }
      for (;;) {
        space();
        if (text.charAt(index) === `]`) {
          throw new Stop(
            index,
            `A comma before \`]\` is not allowed in JSON. Remove the trailing comma.`
          );
        }
        value();
        space();
        if (text.charAt(index) === `,`) {
          index++;
          continue;
        }
        if (text.charAt(index) === `]`) {
          index++;
          return;
        }
        fail(`\`,\` or \`]\` after the item`);
      }
    }
    if (char === `"`) {
      string();
      return;
    }
    if (char === `t`) {
      literal(`true`);
      return;
    }
    if (char === `f`) {
      literal(`false`);
      return;
    }
    if (char === `n`) {
      literal(`null`);
      return;
    }
    if (char === `-` || /\d/.test(char)) {
      number();
      return;
    }
    fail(`a value (an object, array, string, number, true, false or null)`);
  };

  try {
    JSON.parse(text);
    return undefined;
  } catch {
    // Find where, below.
  }
  let found: Stop;
  try {
    value();
    space();
    if (index < text.length) fail(`nothing more after the value`);
    // The reader accepted what JSON.parse refused: report it at the start rather than nowhere.
    found = new Stop(0, `The text is not valid JSON.`);
  } catch (error) {
    found = error instanceof Stop ? error : new Stop(index, String(error));
  }
  const before = text.slice(0, found.offset);
  const line = before.split(`\n`).length;
  const column = found.offset - (before.lastIndexOf(`\n`) + 1) + 1;
  return { message: found.message, offset: found.offset, line, column };
};
