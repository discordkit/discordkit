import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vite-plus/test";
import { preserveFormat } from "../document/preserveFormat.js";

/**
 * Every form edit rewrites the scene file. A person or an agent formatted that file, and an editor that reformatted it on the first keystroke would turn a one-word change into a diff of the whole file and fight whatever formatter the agent runs. These specs hold a write to changing the text of what changed and nothing else.
 */

const wire = async (): Promise<string> =>
  readFile(
    new URL(`../../__tests__/wire/inbou-question.json`, import.meta.url),
    `utf8`
  );

const lines = (text: string): string[] => text.split(`\n`);

/** The lines of `after` that differ from `before`, compared position by position. */
const changedLines = (before: string, after: string): string[] =>
  lines(after).filter((line, index) => lines(before)[index] !== line);

describe(`preserveFormat`, () => {
  it(`writes an unchanged value back byte for byte, one-line objects and all`, async () => {
    const text = await wire();
    expect(preserveFormat(text, JSON.parse(text), `  `)).toBe(text);
  });

  it(`changes one line when one string changes, keeping the hand-formatted button rows on one line each`, async () => {
    const text = await wire();
    const value = JSON.parse(text) as {
      components: { components: { content?: string }[] }[];
    };
    value.components[0].components[0].content = `**もんだい5**`;
    const after = preserveFormat(text, value, `  `);
    expect(JSON.parse(after)).toEqual(value);
    expect(changedLines(text, after)).toEqual([
      `          "content": "**もんだい5**"`
    ]);
  });

  it(`edits a value inside a one-line object without spreading it over several lines`, async () => {
    const text = await wire();
    const value = JSON.parse(text) as {
      components: { components: { label?: string }[] }[];
    };
    value.components[1].components[0].label = `Stop`;
    const after = preserveFormat(text, value, `  `);
    expect(changedLines(text, after)).toEqual([
      `        { "type": 2, "style": 4, "label": "Stop", "custom_id": "exam:end" }`
    ]);
  });

  it(`gives a new item in a row of one-line items one line of its own, styled like its siblings`, async () => {
    const text = await wire();
    const value = JSON.parse(text) as {
      components: { components: unknown[] }[];
    };
    value.components[1].components.push({
      type: 2,
      style: 2,
      label: `Hint`,
      custom_id: `exam:hint`
    });
    const after = preserveFormat(text, value, `  `);
    expect(JSON.parse(after)).toEqual(value);
    expect(after).toContain(
      `        { "type": 2, "style": 4, "label": "End test", "custom_id": "exam:end" },\n        { "type": 2, "style": 2, "label": "Hint", "custom_id": "exam:hint" }\n`
    );
  });

  it(`keeps a moved component's own text when components are reordered`, async () => {
    const text = await wire();
    const value = JSON.parse(text) as { components: unknown[] };
    value.components.reverse();
    const after = preserveFormat(text, value, `  `);
    expect(JSON.parse(after)).toEqual(value);
    // The end-test row was one line per button before it moved, and still is.
    expect(after).toContain(
      `{ "type": 2, "style": 4, "label": "End test", "custom_id": "exam:end" }`
    );
    expect(after).toHaveLength(text.length);
  });

  it(`indents a new multi-line value from the line it starts on, with the file's indentation`, () => {
    const text = `{\n    "messages": []\n}\n`;
    const after = preserveFormat(
      text,
      { messages: [{ payload: { content: `Hi` } }] },
      `    `
    );
    expect(after).toBe(
      `{\n    "messages": [\n        {\n            "payload": {\n                "content": "Hi"\n            }\n        }\n    ]\n}\n`
    );
  });

  it(`drops a removed key with its comma, and leaves the rest alone`, () => {
    const text = `{\n  "type": 17,\n  "accent_color": 3099502,\n  "components": []\n}\n`;
    expect(preserveFormat(text, { type: 17, components: [] }, `  `)).toBe(
      `{\n  "type": 17,\n  "components": []\n}\n`
    );
  });

  it(`treats an undefined key as absent, as JSON.stringify does`, () => {
    const text = `{ "a": 1 }`;
    expect(preserveFormat(text, { a: 1, b: undefined }, 0)).toBe(text);
  });

  it(`keeps a one-line file on one line`, () => {
    const text = `{"flags":32768,"components":[{"type":10,"content":"a"}]}`;
    expect(
      preserveFormat(
        text,
        {
          flags: 32768,
          components: [
            { type: 10, content: `a` },
            { type: 10, content: `b` }
          ]
        },
        0
      )
    ).toBe(
      `{"flags":32768,"components":[{"type":10,"content":"a"},{"type":10,"content":"b"}]}`
    );
  });

  it(`replaces text that does not parse with plain JSON, rather than guessing`, () => {
    expect(preserveFormat(``, { messages: [] }, `  `)).toBe(
      `{\n  "messages": []\n}\n`
    );
  });
});
