import { describe, expect, it } from "vite-plus/test";
import type { MarkdownNode } from "../ast.js";
import { maxDepth } from "../engine.js";
import { parseMarkdown, type MarkdownContext } from "../parse.js";
import { cases } from "./cases.js";

/** How deeply nodes nest, counting list items as a level. */
const depthOf = (nodes: MarkdownNode[]): number =>
  Math.max(
    0,
    ...nodes.map((node) => {
      if (node.type === `list`)
        return 1 + Math.max(0, ...node.items.map(depthOf));
      if (`content` in node && Array.isArray(node.content)) {
        return 1 + depthOf(node.content);
      }
      return 1;
    })
  );

describe(`parseMarkdown`, () => {
  // The cases are data (see cases.ts) so the same strings can be posted to a real channel and compared. A preview that parses differently from Discord shows an author something they will not get, which is worse than no preview.
  it.each(cases)(`$provenance: $name`, ({ source, context, expected }) => {
    expect(parseMarkdown(source, context)).toStrictEqual(expected);
  });

  it(`has no case with a duplicate name, so a calibration result maps back to exactly one case`, () => {
    const names = cases.map(({ name, context }) => `${context}: ${name}`);
    expect(new Set(names).size).toBe(names.length);
  });

  it(`gives equal trees for the same input, whatever was parsed before`, () => {
    // Lint and the renderer may parse the same text at different times; any state leaking between calls would make them disagree.
    const first = cases.map(({ source, context }) =>
      parseMarkdown(source, context)
    );
    const contexts: MarkdownContext[] = [
      `embedTitle`,
      `embedFieldValue`,
      `message`
    ];
    for (const context of contexts) {
      for (const { source } of cases) parseMarkdown(source, context);
    }
    const second = cases.map(({ source, context }) =>
      parseMarkdown(source, context)
    );
    expect(second).toStrictEqual(first);
  });
});

describe(`parseMarkdown on adversarial input`, () => {
  // Agents generate this text, and a preview tool that hangs or throws on a malformed string stops the review loop it exists for. Each input here is the kind of thing that sends a backtracking pattern exponential, or a recursive parser past the stack. Discord allows 4000 characters in a text display; these go well past that.
  const length = 10_000;

  it.each([
    `*`,
    `_`,
    `~`,
    `|`,
    `\``,
    `\\`,
    `<`,
    `>`,
    `#`,
    `-`,
    `[`,
    `(`,
    ` `,
    `\n`
  ])(`parses a run of %j without throwing`, (char) => {
    const source = char.repeat(length);
    expect(() => parseMarkdown(source)).not.toThrow();
    expect(() => parseMarkdown(source, `embedTitle`)).not.toThrow();
  });

  it.each([
    [`bold markers between words`, `**a `.repeat(2500)],
    [`spoiler markers between words`, `||a `.repeat(2500)],
    [`italic markers between words`, `*a `.repeat(3000)],
    [`underscores between words`, `_a `.repeat(3000)],
    [`unclosed link labels`, `[a`.repeat(5000)],
    [`unclosed link targets`, `[a](`.repeat(2500)],
    [`parentheses in a link target`, `[a](https://x/${`(x)`.repeat(3000)} y`],
    [
      `backtick runs of every length`,
      Array.from({ length: 150 }, (_, n) => `\`${`\``.repeat(n)}x`).join(``)
    ],
    [`quote markers`, `> `.repeat(5000)],
    [`list bullets`, `- `.repeat(5000)],
    [
      `nested list indentation`,
      Array.from({ length: 300 }, (_, n) => `${` `.repeat(n)}- x`).join(`\n`)
    ],
    [`URL followed by punctuation`, `https://x${`.`.repeat(length)}`]
  ])(`parses %s without throwing`, (_name, source) => {
    expect(() => parseMarkdown(source)).not.toThrow();
  });

  it(`stops nesting at the depth limit instead of overflowing the stack`, () => {
    const nested = `${`**`.repeat(5000)}x${`**`.repeat(5000)}`;
    const tree = parseMarkdown(nested);
    // Past the limit the remaining delimiters are text, so the tree is bounded by the limit and not by the input.
    expect(depthOf(tree)).toBeLessThanOrEqual(maxDepth + 1);
    expect(JSON.stringify(tree)).toContain(`x`);
  });

  it(`keeps real nesting well inside the limit`, () => {
    // The limit must not change any message a person would write: all eight levels here (quote, list, bold, underline, italic, strikethrough, spoiler, code) are parsed.
    const source = `> - **__*~~||\`x\`||~~*__**`;
    expect(depthOf(parseMarkdown(source))).toBe(8);
  });

  it(`never throws and stays deterministic on random mixes of delimiters`, () => {
    // A seeded generator, so a failure reproduces.
    let seed = 0x2f6b_1d3a;
    const random = (): number => {
      seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    const pieces = [
      `*`,
      `**`,
      `_`,
      `__`,
      `~~`,
      `||`,
      `\``,
      `\`\`\``,
      `\\`,
      `<`,
      `>`,
      `> `,
      `>>> `,
      `#`,
      `# `,
      `-# `,
      `- `,
      `1. `,
      `\n`,
      ` `,
      `[`,
      `]`,
      `(`,
      `)`,
      `<@1>`,
      `<t:1:R>`,
      `https://x.y`,
      `@here`,
      `a`,
      `テスト`,
      `。`,
      `😀`,
      `1️⃣`,
      `:`
    ];
    for (let run = 0; run < 2000; run++) {
      const size = Math.floor(random() * 60);
      const source = Array.from(
        { length: size },
        () => pieces[Math.floor(random() * pieces.length)]
      ).join(``);
      for (const context of [
        `message`,
        `embedFieldValue`,
        `embedTitle`
      ] as const) {
        // The source rides along so a failure shows which input caused it.
        const first = { source, tree: parseMarkdown(source, context) };
        expect({ source, tree: parseMarkdown(source, context) }).toStrictEqual(
          first
        );
      }
    }
  });
});
