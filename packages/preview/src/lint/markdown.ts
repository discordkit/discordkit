import type { MarkdownNode } from "../markdown/ast.js";
import {
  contextRuleSets,
  parseMarkdown,
  type MarkdownContext
} from "../markdown/parse.js";
import { ruleSets, type RuleName } from "../markdown/rules.js";
import type { Finding, LintCode, Path } from "../findings.js";

/** Where a piece of text sits, in words, for messages. */
const contextNames: Record<MarkdownContext, string> = {
  message: `message content`,
  textDisplay: `a Text Display`,
  embedDescription: `an embed description`,
  embedFieldValue: `an embed field value`,
  embedTitle: `an embed title`,
  embedFieldName: `an embed field name`,
  embedAuthor: `an embed author name`,
  embedFooter: `an embed footer`
};

/** Stands for anything in a line that is not plain text: a mention, an emoji, code. Never matches the patterns below. */
const opaque = `\u0000`;

/** A node's visible text with formatting removed, so a pattern can be matched across `**bold**` and the like. Code is opaque: nothing inside it is markdown. */
const flatten = (nodes: readonly MarkdownNode[]): string =>
  nodes.map(flattenNode).join(``);

const flattenNode = (node: MarkdownNode): string => {
  if (node.type === `text`) return node.content;
  if (node.type === `link`) {
    return node.masked ? flatten(node.content) : opaque;
  }
  if (
    node.type === `bold` ||
    node.type === `italic` ||
    node.type === `underline` ||
    node.type === `strikethrough` ||
    node.type === `spoiler`
  ) {
    return flatten(node.content);
  }
  return opaque;
};

/** Nodes that are a line of their own and consume the newline that ends them. */
const endsLine = new Set<MarkdownNode[`type`]>([
  `lineBreak`,
  `heading`,
  `subtext`,
  `blockQuote`,
  `list`,
  `codeBlock`
]);

interface Line {
  /** The line's text as written, after any construct that opened it (a heading's text without its `##`). */
  text: string;
  /** Whether the text sits at the start of a line, where a heading or subtext marker would take effect. False for the inside of a heading or subtext, which is already past its marker. */
  atLineStart: boolean;
}

/** Splits a run of nodes into lines, descending into quotes and list items, whose contents start lines of their own. */
const linesOf = (nodes: readonly MarkdownNode[]): Line[] => {
  const lines: Line[] = [];
  let current: MarkdownNode[] = [];
  const close = (): void => {
    if (current.length > 0) {
      lines.push({ text: flatten(current), atLineStart: true });
    }
    current = [];
  };
  for (const node of nodes) {
    if (!endsLine.has(node.type)) {
      current.push(node);
      continue;
    }
    close();
    if (node.type === `heading` || node.type === `subtext`) {
      lines.push({ text: flatten(node.content), atLineStart: false });
    } else if (node.type === `blockQuote`) {
      lines.push(...linesOf(node.content));
    } else if (node.type === `list`) {
      for (const item of node.items) lines.push(...linesOf(item));
    }
  }
  close();
  return lines;
};

const snippet = (text: string): string =>
  JSON.stringify(text.replaceAll(opaque, `…`).trim().slice(0, 60));

/**
 * Findings for markdown that will not render as its author meant, found by parsing the text with this package's parser in the context Discord renders it in: the rule set decides whether a heading marker is markdown at all there.
 */
export const markdownFindings = (
  source: string,
  context: MarkdownContext,
  path: Path
): Finding[] => {
  const rules: readonly RuleName[] = ruleSets[contextRuleSets[context]];
  const has = (rule: RuleName): boolean => rules.includes(rule);
  const where = contextNames[context];
  const findings: Finding[] = [];
  const add = (code: LintCode, message: string): void => {
    findings.push({ code, severity: `warning`, path, message });
  };
  const nodes = parseMarkdown(source, context);
  for (const { text, atLineStart } of linesOf(nodes)) {
    const line = snippet(text);
    if (atLineStart) {
      if (has(`subtext`) && /^ *-#(?! )/.test(text)) {
        add(
          `subtext-missing-space`,
          `The line ${line} in ${where} starts with \`-#\` but no space after it, so Discord shows the \`-#\` literally instead of drawing the line as small, muted subtext. Put a space after \`-#\`.`
        );
      }
      if (has(`heading`) && /^ *#{1,3}(?=[^\s#])/.test(text)) {
        add(
          `heading-missing-space`,
          `The line ${line} in ${where} starts with a heading marker but no space after it, so Discord shows the \`#\` characters literally instead of a heading. Put a space after the last \`#\`.`
        );
      }
      if (has(`heading`) && /^ *#{4,} /.test(text)) {
        add(
          `heading-too-deep`,
          `The line ${line} in ${where} starts with four or more \`#\`, but Discord draws only three heading levels (\`#\`, \`##\`, \`###\`), so the line shows its \`#\` characters literally. Use \`###\` or fewer, or \`-# \` for small text.`
        );
      }
      if (!has(`heading`) && /^ *#{1,3} +\S/.test(text)) {
        add(
          `markdown-unsupported-here`,
          `The line ${line} in ${where} is written as a heading, but Discord does not draw headings in ${where}, so the \`#\` characters show literally. Remove the marker, or move the text somewhere headings render, such as an embed description or a Text Display.`
        );
      }
      if (!has(`subtext`) && /^ *-# +\S/.test(text)) {
        add(
          `markdown-unsupported-here`,
          `The line ${line} in ${where} is written as subtext, but Discord does not draw subtext in ${where}, so the \`-#\` shows literally. Remove the marker, or move the text somewhere subtext renders, such as an embed description or a Text Display.`
        );
      }
    }
    // A lone `#` mid-line is too often meant literally ("ticket # 12") to report.
    const midLine = /[^\S\n](#{2,3}|-#) +\S/g;
    for (const match of text.matchAll(midLine)) {
      const [, marker] = match;
      const before = text.slice(0, match.index);
      if (atLineStart && before.trim() === ``) continue;
      add(
        `heading-not-at-line-start`,
        `In ${where}, ${line} has \`${marker} \` in the middle of a line, which Discord shows literally: a heading or subtext marker only takes effect at the start of a line. If it is meant to style the text after it, start a new line before the marker; if it is meant literally, escape it as \`\\${marker}\`.`
      );
    }
    if (!has(`userMention`)) {
      for (const [mention] of text.matchAll(/<@[!&]?\d+>/g)) {
        add(
          `mention-literal`,
          `${where.charAt(0).toUpperCase()}${where.slice(1)} has the mention \`${mention}\`, but Discord does not resolve user or role mentions in ${where}, so the raw \`${mention}\` is shown. Move the mention into the description or a field value, or write the name as plain text.`
        );
      }
    }
    for (const [whole, target] of text.matchAll(
      /\[[^\]\n]+\]\(\s*<?([^)\s>]+)>?\)/g
    )) {
      if (/^https?:\/\//i.test(target)) continue;
      add(
        `link-scheme`,
        `In ${where}, the masked link ${JSON.stringify(whole)} points at ${JSON.stringify(target)}, but Discord makes a masked link only for an http or https URL, so the brackets and target show literally. Use a full https:// URL, or write the text without link syntax.`
      );
    }
  }
  return findings;
};
