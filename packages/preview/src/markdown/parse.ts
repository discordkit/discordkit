import type { MarkdownNode } from "./ast.js";
import { createParser, initialState, type NestedParse } from "./engine.js";
import { rules, ruleSets, type RuleSetName } from "./rules.js";

/** Where a piece of text appears. Each place renders a different subset of markdown. */
export type MarkdownContext =
  | `message`
  | `textDisplay`
  | `embedDescription`
  | `embedFieldValue`
  | `embedTitle`
  | `embedFieldName`
  | `embedAuthor`
  | `embedFooter`;

/** The rule set each context uses (spec section 6). */
export const contextRuleSets = {
  message: `full`,
  textDisplay: `full`,
  embedDescription: `full`,
  embedFieldValue: `fieldValue`,
  embedTitle: `reduced`,
  embedFieldName: `reduced`,
  embedAuthor: `reduced`,
  embedFooter: `reduced`
} as const satisfies Record<MarkdownContext, RuleSetName>;

const parsers: Record<RuleSetName, NestedParse> = {
  full: createParser(ruleSets.full.map((name) => rules[name])),
  fieldValue: createParser(ruleSets.fieldValue.map((name) => rules[name])),
  reduced: createParser(ruleSets.reduced.map((name) => rules[name]))
};

/**
 * Parses Discord-flavoured markdown into a typed tree, using the rules Discord applies in `context` (a message's content by default). Never throws, and parsing the same input twice gives equal trees.
 *
 * @example
 * parseMarkdown(`## Round 3\n-# <t:1764000000:R>`);
 * parseMarkdown(`Winner: <@80351110224678912>`, `embedTitle`); // the mention stays text
 */
export const parseMarkdown = (
  source: string,
  context: MarkdownContext = `message`
): MarkdownNode[] =>
  parsers[contextRuleSets[context]](
    source.replace(/\r\n?/g, `\n`),
    initialState,
    true
  );
