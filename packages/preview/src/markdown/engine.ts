import type { MarkdownNode } from "./ast.js";

/**
 * The parsing engine: a small re-implementation of the algorithm in Khan Academy's simple-markdown 0.7.3 (MIT, see THIRD_PARTY_NOTICES.md), which Discord's clients are built on. At each position the rules are tried in a fixed order and the first one whose `match` succeeds consumes its capture; its `parse` may recurse into the captured content. Rules that share an `order` and define `quality` compete on it, and the highest quality wins (simple-markdown uses this for `*`, `**` and `__`, which is how `***x***` resolves). Many of Discord's quirks follow from this order, which is why it is reproduced rather than approximated.
 *
 * Two departures from simple-markdown, both so that no input can make the parser throw: a nesting limit (`maxDepth`), past which rules that recurse stop matching and their delimiters stay text, and a fallback that consumes one character as text if no rule matches or a rule matches nothing.
 */

/** What a rule can see of where it is. Threaded through nested parses as a fresh object each time, never mutated, so parsing has no hidden state. */
export interface ParseState {
  /** Inside inline formatting, where line-level constructs (headings, quotes, lists) cannot start. simple-markdown's `state.inline`. */
  readonly inline: boolean;
  /** Inside a block quote, where another quote cannot start. */
  readonly inQuote: boolean;
  /** Inside a masked link's label, where another link cannot start. */
  readonly inLink: boolean;
  /** How many nested parses deep this is. */
  readonly depth: number;
}

/** A match: element 0 is the source consumed, the rest are whatever the rule's `parse` needs. Regular expression results fit this shape. */
export type Capture = ReadonlyArray<string | undefined> & {
  readonly 0: string;
};

/** Parses `source` with the same rules. `atLineStart` says whether position 0 counts as the start of a line, for content such as a quote's that is lifted out of its line prefixes. */
export type NestedParse = (
  source: string,
  state: ParseState,
  atLineStart?: boolean
) => MarkdownNode[];

export interface Rule {
  /** Lower runs first. */
  readonly order: number;
  /** The rule recurses into its content, so it stops matching at the nesting limit. */
  readonly nests?: boolean;
  /** Must only ever match at index 0 of `source`. `atLineStart` is true when the previous capture ended with a newline, or at the start of a parse that began a line. */
  readonly match: (
    source: string,
    state: ParseState,
    atLineStart: boolean
  ) => Capture | null;
  /** Among rules with the same `order`, the match with the highest quality wins. */
  readonly quality?: (capture: Capture) => number;
  readonly parse: (
    capture: Capture,
    state: ParseState,
    parse: NestedParse
  ) => MarkdownNode | MarkdownNode[];
}

/** Nesting deeper than this leaves the remaining delimiters as text. Real messages nest a few levels; the limit exists so that a run of thousands of `*` cannot overflow the stack. */
export const maxDepth = 32;

export const initialState: ParseState = {
  inline: false,
  inQuote: false,
  inLink: false,
  depth: 0
};

const pushNode = (nodes: MarkdownNode[], node: MarkdownNode): void => {
  const last = nodes.at(-1);
  // Adjacent text is merged, so the tree does not depend on where the text rule happened to stop.
  if (node.type === `text` && last?.type === `text`) {
    nodes[nodes.length - 1] = {
      type: `text`,
      content: last.content + node.content
    };
  } else {
    nodes.push(node);
  }
};

/** Sorts by `order`, then puts rules with a quality function first within an order, as simple-markdown does, then keeps the given order. */
const sortRules = (rules: readonly Rule[]): Rule[] =>
  rules
    .map((rule, index) => ({ rule, index }))
    .sort(
      (a, b) =>
        a.rule.order - b.rule.order ||
        (a.rule.quality ? 0 : 1) - (b.rule.quality ? 0 : 1) ||
        a.index - b.index
    )
    .map(({ rule }) => rule);

export const createParser = (rules: readonly Rule[]): NestedParse => {
  const sorted = sortRules(rules);

  const parse: NestedParse = (source, state, atLineStart = false) => {
    const nodes: MarkdownNode[] = [];
    const nested: NestedParse = (content, nestedState, nestedLineStart) =>
      parse(
        content,
        { ...nestedState, depth: nestedState.depth + 1 },
        nestedLineStart
      );
    let rest = source;
    let lineStart = atLineStart;

    while (rest.length > 0) {
      let best: Rule | undefined;
      let capture: Capture | null = null;
      let quality = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < sorted.length; i++) {
        const rule = sorted[i];
        if (!(rule.nests && state.depth >= maxDepth)) {
          const current = rule.match(rest, state, lineStart);
          if (current && current[0].length > 0) {
            const currentQuality = rule.quality?.(current) ?? 0;
            if (!capture || currentQuality > quality) {
              best = rule;
              capture = current;
              quality = currentQuality;
            }
          }
        }
        const next = sorted.at(i + 1);
        // simple-markdown stops at the first match, unless the next rule shares this rule's order and can compete on quality.
        if (capture && !(next?.order === rule.order && next.quality)) {
          break;
        }
      }

      if (best && capture) {
        const parsed = best.parse(capture, state, nested);
        for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
          pushNode(nodes, node);
        }
        rest = rest.slice(capture[0].length);
        lineStart = capture[0].endsWith(`\n`);
      } else {
        // Unreachable with the shipped rule sets, whose text rule always matches; kept so a rule set without one still cannot loop or throw.
        const char = String.fromCodePoint(rest.codePointAt(0) ?? 0);
        pushNode(nodes, { type: `text`, content: char });
        rest = rest.slice(char.length);
        lineStart = char === `\n`;
      }
    }
    return nodes;
  };

  return parse;
};
