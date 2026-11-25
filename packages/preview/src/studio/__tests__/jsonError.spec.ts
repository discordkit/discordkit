import { describe, expect, it } from "vite-plus/test";
import { findJsonError } from "../document/jsonError.js";

/**
 * While the JSON pane's text does not parse, nothing is saved and the preview shows the last version that did, so the pane has to say what is wrong and exactly where, in every browser. Browsers' own messages differ and some give no position, which is why Studio finds the place itself.
 */
describe(`findJsonError`, () => {
  it(`finds nothing wrong with valid JSON`, () => {
    expect(findJsonError(`{"a": [1, true, null, "x\\n"]}`)).toBeUndefined();
  });

  it.each([
    [`a missing comma`, `{\n  "a": 1\n  "b": 2\n}`, 3, 3, /`,` or `}`/],
    [`a trailing comma`, `{\n  "a": 1,\n}`, 3, 1, /trailing comma/],
    [`a single-quoted string`, `{'a': 1}`, 1, 2, /single quote/],
    [`an unclosed string`, `{"a": "never closed`, 1, 20, /never closed/],
    [`text cut off at the end`, `{"a": [1, 2`, 1, 12, /the end of the text/],
    [`a line break inside a string`, `{"a": "one\ntwo"}`, 1, 11, /next line/],
    [`something after the value`, `{} {}`, 1, 4, /nothing more/],
    [`an unknown word`, `{"a": tru}`, 1, 10, /`true`/]
  ])(`points at %s`, (_, text, line, column, message) => {
    const error = findJsonError(text);
    expect(error).toMatchObject({ line, column });
    expect(error?.message).toMatch(message);
    // The offset and the line and column name the same place, so "Go to" lands where the message says.
    const lines = text.slice(0, error?.offset).split(`\n`);
    expect(lines).toHaveLength(line);
    expect((lines.at(-1)?.length ?? 0) + 1).toBe(column);
  });
});
