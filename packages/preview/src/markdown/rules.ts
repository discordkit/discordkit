import type { GuildNavigationTarget, ListNode, TimestampStyle } from "./ast.js";
import type { Capture, ParseState, Rule } from "./engine.js";

/**
 * Discord's markdown rules, in the order the engine tries them.
 *
 * The order follows simple-markdown 0.7.3's default rules, which Discord started from: line-level constructs first, then escapes, links, emphasis, strikethrough, inline code, and text last. Discord's own tokens are slotted in where they cannot collide: mentions, timestamps and custom emoji (all starting with `<` or `@`) before emphasis, spoilers and Unicode emoji after strikethrough. Almost none of them can start with the same character as another rule, so their exact place mostly matters only relative to `text`; the exception is a `*️⃣` keycap, which italic gets to first. The emphasis, strong, underline, URL and escape patterns are adapted from simple-markdown (MIT, see THIRD_PARTY_NOTICES.md). Everything else is written for Discord's syntax, and where a pattern in simple-markdown could backtrack catastrophically (its link and inline-code patterns), it is replaced by a scanner that does the same job in one pass.
 *
 * Discord parses a message as one run of inline content rather than as paragraphs, which is why newlines and blank lines survive and why "before ```code``` after" makes a code block in the middle of a line. Line-level constructs (heading, subtext, quote, list) therefore check that they start a line instead of relying on a block scope, and are switched off inside inline formatting through `state.inline`.
 */

const inlineState = (state: ParseState): ParseState => ({
  ...state,
  inline: true
});

/** Index of the newline that ends the line starting at `from`, or the end of the source. */
const lineEnd = (source: string, from = 0): number => {
  const index = source.indexOf(`\n`, from);
  return index === -1 ? source.length : index;
};

/** Line-level constructs consume the newline that ends them, so the next line starts fresh and no empty line appears after a heading, quote, list or code block. */
const throughNewline = (source: string, end: number): number =>
  source[end] === `\n` ? end + 1 : end;

const hasVisibleText = (text: string): boolean => text.trim().length > 0;

const capture = (
  consumed: string,
  ...parts: Array<string | undefined>
): Capture => [consumed, ...parts];

const regexMatch =
  (regex: RegExp): Rule[`match`] =>
  (source) =>
    regex.exec(source);

const timestampStyles: readonly string[] = [
  `t`,
  `T`,
  `d`,
  `D`,
  `f`,
  `F`,
  `s`,
  `S`,
  `R`
] satisfies TimestampStyle[];

const isTimestampStyle = (style: string): style is TimestampStyle =>
  timestampStyles.includes(style);

const guildNavigationTargets: readonly string[] = [
  `customize`,
  `browse`,
  `guide`,
  `linked-roles`
] satisfies GuildNavigationTarget[];

const isGuildNavigationTarget = (
  target: string
): target is GuildNavigationTarget => guildNavigationTargets.includes(target);

/** simple-markdown's heading strips a closing run of `#` and trailing spaces, leaving at least one character. */
const stripClosingHashes = (text: string): string => {
  let end = text.length;
  while (end > 1 && text[end - 1] === ` `) end--;
  while (end > 1 && text[end - 1] === `#`) end--;
  return text.slice(0, end);
};

const headingPrefix = /^ *(#{1,3}) +/;
const subtextPrefix = /^ *-# +/;
const quoteAllPrefix = /^ *>>> /;
const quoteLinePrefix = /^ *> /;
const listItemPrefix = /^( *)([*-]|\d+\.) +(?=[^ \n])/;
const fenceWithLang = /^```([A-Za-z0-9_+\-.#]+)\n/;
const urlStart = /^https?:\/\//;
const unescapeUrl = (url: string): string =>
  url.replace(/\\([^0-9A-Za-z\s])/g, `$1`);
const emojiAtStart = /^\p{RGI_Emoji}/v;

const matchLinePrefixed =
  (prefix: RegExp): Rule[`match`] =>
  (source, state, atLineStart) => {
    if (state.inline || !atLineStart) return null;
    const head = prefix.exec(source);
    if (!head) return null;
    const end = lineEnd(source);
    const content = source.slice(head[0].length, end);
    if (!hasVisibleText(content)) return null;
    return capture(
      source.slice(0, throughNewline(source, end)),
      content,
      head[1]
    );
  };

/** The closing fence for a code block whose content starts at `start`. Content may not be empty, and leading and trailing newlines are not part of it. */
const closeFence = (
  source: string,
  start: number,
  lang: string | undefined
): Capture | null => {
  let from = start;
  while (source[from] === `\n`) from++;
  if (from >= source.length) return null;
  const close = source.indexOf(`\`\`\``, from + 1);
  if (close === -1) return null;
  let contentEnd = close;
  while (contentEnd > from && source[contentEnd - 1] === `\n`) contentEnd--;
  return capture(
    source.slice(0, throughNewline(source, close + 3)),
    source.slice(from, contentEnd),
    lang
  );
};

/** Index of the `]` that closes the `[` at index 0, honouring escapes and nested brackets. */
const closeLabel = (source: string): number | null => {
  let depth = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === `\\`) {
      i++;
    } else if (char === `[`) {
      depth++;
    } else if (char === `]`) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return null;
};

const isSpace = (char: string | undefined): boolean =>
  char !== undefined && /\s/.test(char);

/** `[label](url)`, `[label](<url>)` and `[label](url "title")`. Only http and https targets make a link; anything else stays text. */
const matchMaskedLink: Rule[`match`] = (source, state) => {
  if (state.inLink || !source.startsWith(`[`)) return null;
  const labelEnd = closeLabel(source);
  if (labelEnd === null || source[labelEnd + 1] !== `(`) return null;
  let i = labelEnd + 2;
  while (isSpace(source[i])) i++;
  let target = ``;
  const angled = source[i] === `<`;
  if (angled) {
    const close = source.indexOf(`>`, i);
    if (close === -1) return null;
    target = source.slice(i + 1, close);
    if (/\s/.test(target)) return null;
    i = close + 1;
  } else {
    let depth = 0;
    const start = i;
    while (i < source.length) {
      const char = source[i];
      if (char === `\\` && i + 1 < source.length) {
        i += 2;
        continue;
      }
      if (isSpace(char)) break;
      if (char === `(`) depth++;
      if (char === `)`) {
        if (depth === 0) break;
        depth--;
      }
      i++;
    }
    target = source.slice(start, i);
  }
  let title: string | undefined;
  const beforeTitle = i;
  while (isSpace(source[i])) i++;
  const quote = source[i];
  if (i > beforeTitle && (quote === `"` || quote === `'`)) {
    const close = source.indexOf(quote, i + 1);
    if (close === -1) return null;
    title = source.slice(i + 1, close);
    i = close + 1;
    while (isSpace(source[i])) i++;
  }
  if (source[i] !== `)`) return null;
  const url = unescapeUrl(target);
  if (!urlStart.test(url)) return null;
  return capture(
    source.slice(0, i + 1),
    source.slice(1, labelEnd),
    url,
    title,
    angled ? `<` : ``
  );
};

/**
 * Inline code, with the semantics of simple-markdown's ``/^(`+)([\s\S]*?[^`])\1(?!`)/``: an opening run of backticks, then the first later run of exactly as many. When the whole opening run finds no partner, a shorter prefix of it may, in which case the rest of the run becomes content. That pattern backtracks in cubic time on a long run of backticks, so this finds the same answer in one pass.
 */
const matchInlineCode: Rule[`match`] = (source) => {
  if (!source.startsWith(`\``)) return null;
  let opening = 0;
  while (source[opening] === `\``) opening++;
  // For each run length up to the opening run's, the start of the first later run of exactly that length.
  const firstRunOfLength = new Map<number, number>();
  let i = opening;
  while (i < source.length) {
    if (source[i] === `\``) {
      const start = i;
      while (source[i] === `\``) i++;
      const length = i - start;
      if (length <= opening && !firstRunOfLength.has(length)) {
        firstRunOfLength.set(length, start);
      }
    } else {
      i++;
    }
  }
  for (let length = opening; length > 0; length--) {
    const start = firstRunOfLength.get(length);
    if (start !== undefined) {
      return capture(
        source.slice(0, start + length),
        source.slice(length, start)
      );
    }
  }
  return null;
};

/** simple-markdown drops one space of padding that sits next to a backtick, so that `` `` `code` `` `` can show backticks. */
const trimCodePadding = (content: string): string => {
  let start = 0;
  let end = content.length;
  if (content.startsWith(` `) && content.trimStart().startsWith(`\``)) {
    start = 1;
  }
  if (
    content.endsWith(` `) &&
    content.trimEnd().endsWith(`\``) &&
    end > start
  ) {
    end -= 1;
  }
  return content.slice(start, end);
};

/**
 * Whether the text rule keeps going at index `i`. Following simple-markdown, text stops before any ASCII symbol so the rules that start with one get their turn, and runs through letters, digits, spaces and everything from U+00C0 up (which covers CJK text and full-width punctuation, so `＿` and `。` are always plain text). Unlike simple-markdown it also stops before a Unicode emoji, a keycap, a URL and a newline, so those rules can match.
 */
const continuesText = (source: string, i: number): boolean => {
  const code = source.charCodeAt(i);
  if (code === 0x0a) return false;
  const isDigit = code >= 0x30 && code <= 0x39;
  const isLetter = (code | 0x20) >= 0x61 && (code | 0x20) <= 0x7a;
  if (isDigit || isLetter) {
    const next = source.charCodeAt(i + 1);
    if (isDigit && (next === 0xfe0f || next === 0x20e3)) return false;
    if (code === 0x68 && urlStart.test(source.slice(i))) return false;
    return true;
  }
  if (code < 0xc0) return /\s/.test(source[i]);
  return !emojiAtStart.test(source.slice(i));
};

export type RuleName =
  | `heading`
  | `subtext`
  | `codeBlock`
  | `blockQuote`
  | `list`
  | `lineBreak`
  | `escape`
  | `autolink`
  | `url`
  | `maskedLink`
  | `userMention`
  | `roleMention`
  | `channelMention`
  | `commandMention`
  | `guildNavigation`
  | `timestamp`
  | `customEmoji`
  | `globalMention`
  | `italic`
  | `bold`
  | `underline`
  | `strikethrough`
  | `spoiler`
  | `inlineCode`
  | `emoji`
  | `text`;

export const rules: Readonly<Record<RuleName, Rule>> = {
  heading: {
    order: 0,
    nests: true,
    match: (source, state, atLineStart) => {
      if (state.inline || !atLineStart) return null;
      const head = headingPrefix.exec(source);
      if (!head) return null;
      const end = lineEnd(source);
      const content = stripClosingHashes(source.slice(head[0].length, end));
      if (!hasVisibleText(content)) return null;
      return capture(
        source.slice(0, throughNewline(source, end)),
        content,
        head[1]
      );
    },
    parse: ([, content = ``, hashes = `#`], state, parse) => ({
      type: `heading`,
      level: hashes.length === 1 ? 1 : hashes.length === 2 ? 2 : 3,
      content: parse(content, inlineState(state))
    })
  },
  subtext: {
    order: 1,
    nests: true,
    match: matchLinePrefixed(subtextPrefix),
    parse: ([, content = ``], state, parse) => ({
      type: `subtext`,
      content: parse(content, inlineState(state))
    })
  },
  codeBlock: {
    order: 2,
    match: (source) => {
      if (!source.startsWith(`\`\`\``)) return null;
      const lang = fenceWithLang.exec(source);
      return (
        (lang && closeFence(source, lang[0].length, lang[1])) ??
        closeFence(source, 3, undefined)
      );
    },
    parse: ([, content = ``, lang]) =>
      lang === undefined
        ? { type: `codeBlock`, content }
        : { type: `codeBlock`, lang, content }
  },
  blockQuote: {
    order: 3,
    nests: true,
    match: (source, state, atLineStart) => {
      if (state.inline || state.inQuote || !atLineStart) return null;
      const all = quoteAllPrefix.exec(source);
      if (all) return capture(source, source.slice(all[0].length));
      const lines: string[] = [];
      let end = 0;
      while (end < source.length) {
        const prefix = quoteLinePrefix.exec(source.slice(end));
        if (!prefix) break;
        const lineStop = lineEnd(source, end);
        lines.push(source.slice(end + prefix[0].length, lineStop));
        end = throughNewline(source, lineStop);
      }
      return lines.length > 0
        ? capture(source.slice(0, end), lines.join(`\n`))
        : null;
    },
    parse: ([, content = ``], state, parse) => ({
      type: `blockQuote`,
      content: parse(content, { ...state, inQuote: true }, true)
    })
  },
  list: {
    order: 4,
    nests: true,
    match: (source, state, atLineStart) => {
      if (state.inline || !atLineStart) return null;
      const first = listItemPrefix.exec(source);
      if (!first) return null;
      const indent = first[1].length;
      let end = throughNewline(source, lineEnd(source));
      // The list goes on while the next line is indented (a nested list or a continuation) or is another item at the same indent. Any other line, blank lines included, ends it.
      while (end < source.length && source[end - 1] === `\n`) {
        const next = source.slice(end);
        const item = listItemPrefix.exec(next);
        if (!(next.startsWith(` `) || item?.[1].length === indent)) break;
        end = throughNewline(source, lineEnd(source, end));
      }
      return capture(source.slice(0, end), String(indent));
    },
    parse: ([source, indentText = `0`], state, parse) => {
      const indent = Number(indentText);
      const lines = source.replace(/\n$/, ``).split(`\n`);
      const items: Array<{ prefix: number; lines: string[] }> = [];
      let bullet = ``;
      for (const line of lines) {
        const item = listItemPrefix.exec(line);
        if (item?.[1].length === indent) {
          bullet ||= item[2];
          items.push({
            prefix: item[0].length,
            lines: [line.slice(item[0].length)]
          });
        } else {
          const current = items.at(-1);
          // Continuation lines lose up to the item's prefix width of indentation, as in simple-markdown, so a nested list starts at the beginning of a line again.
          const strip = current?.prefix ?? 0;
          let cut = 0;
          while (cut < strip && line[cut] === ` `) cut++;
          current?.lines.push(line.slice(cut));
        }
      }
      const ordered = /^\d/.test(bullet);
      const list: ListNode = {
        type: `list`,
        ordered,
        items: items.map((item) =>
          parse(item.lines.join(`\n`), { ...state, inline: false }, true)
        )
      };
      if (ordered) list.start = Number.parseInt(bullet, 10);
      return list;
    }
  },
  lineBreak: {
    order: 5,
    match: (source) => (source.startsWith(`\n`) ? capture(`\n`) : null),
    parse: () => ({ type: `lineBreak` })
  },
  escape: {
    order: 6,
    // From simple-markdown: letters, digits and whitespace cannot be escaped, so a backslash in ordinary prose is shown as written. The `u` flag keeps an escaped astral character whole.
    match: regexMatch(/^\\([^0-9A-Za-z\s])/u),
    parse: ([, char = ``]) => ({ type: `text`, content: char })
  },
  autolink: {
    order: 7,
    match: (source, state) =>
      state.inLink ? null : /^<(https?:\/\/[^\s>]+)>/.exec(source),
    parse: ([, url = ``]) => ({
      type: `link`,
      target: url,
      content: [{ type: `text`, content: url }],
      masked: false,
      suppressEmbed: true
    })
  },
  url: {
    order: 8,
    // simple-markdown's bare-URL pattern: trailing punctuation such as `.` `,` `)` is left out of the link.
    match: (source, state) =>
      state.inLink ? null : /^https?:\/\/[^\s<]+[^<.,:;"')\]\s]/.exec(source),
    parse: ([url]) => ({
      type: `link`,
      target: url,
      content: [{ type: `text`, content: url }],
      masked: false,
      suppressEmbed: false
    })
  },
  maskedLink: {
    order: 9,
    nests: true,
    match: matchMaskedLink,
    parse: ([, label = ``, target = ``, title, angled], state, parse) => {
      const content = parse(label, { ...state, inline: true, inLink: true });
      const base = {
        type: `link`,
        target,
        content,
        masked: true,
        suppressEmbed: angled === `<`
      } as const;
      return title === undefined ? base : { ...base, title };
    }
  },
  userMention: {
    order: 10,
    match: regexMatch(/^<@!?(\d+)>/),
    parse: ([, id = ``]) => ({ type: `userMention`, id })
  },
  roleMention: {
    order: 11,
    match: regexMatch(/^<@&(\d+)>/),
    parse: ([, id = ``]) => ({ type: `roleMention`, id })
  },
  channelMention: {
    order: 12,
    match: regexMatch(/^<#(\d+)>/),
    parse: ([, id = ``]) => ({ type: `channelMention`, id })
  },
  commandMention: {
    order: 13,
    // Up to three name parts. The character class is Discord's rule for command names.
    match: regexMatch(
      /^<\/([-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}(?: [-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}){0,2}):(\d+)>/u
    ),
    parse: ([, name = ``, id = ``]) => ({ type: `commandMention`, name, id })
  },
  guildNavigation: {
    order: 14,
    match: (source) => {
      const match: Capture | null = /^<id:([a-z-]+)(?::(\d+))?>/.exec(source);
      const [, target = ``, roleId] = match ?? [];
      if (!isGuildNavigationTarget(target)) return null;
      // Only linked-roles takes a role id.
      if (roleId !== undefined && target !== `linked-roles`) return null;
      return match;
    },
    parse: ([raw, target = ``, roleId]) => {
      // `match` has already checked the target; this only narrows the type.
      if (!isGuildNavigationTarget(target))
        return { type: `text`, content: raw };
      return roleId === undefined
        ? { type: `guildNavigation`, target }
        : { type: `guildNavigation`, target, roleId };
    }
  },
  timestamp: {
    order: 15,
    match: (source) => {
      const match = /^<t:(-?\d+)(?::(\w))?>/.exec(source);
      // An unknown style letter leaves the whole token as text.
      if (match?.[2] !== undefined && !isTimestampStyle(match[2])) return null;
      return match;
    },
    parse: ([, seconds = `0`, style = `f`]) => ({
      type: `timestamp`,
      timestamp: Number(seconds),
      style: isTimestampStyle(style) ? style : `f`
    })
  },
  customEmoji: {
    order: 16,
    match: regexMatch(/^<(a?):(\w+):(\d+)>/),
    parse: ([, animated, name = ``, id = ``]) => ({
      type: `customEmoji`,
      name,
      id,
      animated: animated === `a`
    })
  },
  globalMention: {
    order: 17,
    match: regexMatch(/^@(everyone|here)/),
    parse: ([, target]) => ({
      type: `globalMention`,
      target: target === `here` ? `here` : `everyone`
    })
  },
  italic: {
    order: 18,
    nests: true,
    // simple-markdown's `em`. The `_` form needs a word boundary after the closing `_`, which is what keeps snake_case from italicising; the `*` form needs a non-space after the opening `*` and before the closing one. Wins ties against bold and underline.
    match: regexMatch(
      /^_((?:__|\\[\s\S]|[^\\_])+?)_\b|^\*(?=\S)((?:\*\*|\\[\s\S]|\s+(?:\\[\s\S]|[^\s*\\]|\*\*)|[^\s*\\])+?)\*(?!\*)/
    ),
    quality: (match) => match[0].length + 0.2,
    parse: ([, underscored, starred], state, parse) => ({
      type: `italic`,
      content: parse(underscored ?? starred ?? ``, inlineState(state))
    })
  },
  bold: {
    order: 18,
    nests: true,
    match: regexMatch(/^\*\*((?:\\[\s\S]|[^\\])+?)\*\*(?!\*)/),
    quality: (match) => match[0].length + 0.1,
    parse: ([, content = ``], state, parse) => ({
      type: `bold`,
      content: parse(content, inlineState(state))
    })
  },
  underline: {
    order: 18,
    nests: true,
    match: regexMatch(/^__((?:\\[\s\S]|[^\\])+?)__(?!_)/),
    quality: (match) => match[0].length,
    parse: ([, content = ``], state, parse) => ({
      type: `underline`,
      content: parse(content, inlineState(state))
    })
  },
  strikethrough: {
    order: 19,
    nests: true,
    // Written like bold rather than like simple-markdown's `del`, which refuses a space just inside the tildes. Unverified: assumed to match how Discord treats `** bold **`.
    match: regexMatch(/^~~((?:\\[\s\S]|[^\\])+?)~~(?!~)/),
    parse: ([, content = ``], state, parse) => ({
      type: `strikethrough`,
      content: parse(content, inlineState(state))
    })
  },
  spoiler: {
    order: 20,
    nests: true,
    // Lazy, crosses newlines, and does not look at the characters around the pipes. Skips escaped characters inside, like bold; unverified.
    match: regexMatch(/^\|\|((?:\\[\s\S]|[^\\])+?)\|\|/),
    parse: ([, content = ``], state, parse) => ({
      type: `spoiler`,
      content: parse(content, inlineState(state))
    })
  },
  inlineCode: {
    order: 21,
    match: matchInlineCode,
    parse: ([, content = ``]) => ({
      type: `inlineCode`,
      content: trimCodePadding(content)
    })
  },
  emoji: {
    order: 22,
    match: regexMatch(emojiAtStart),
    parse: ([value]) => ({ type: `emoji`, value })
  },
  text: {
    order: 23,
    match: (source) => {
      let i = String.fromCodePoint(source.codePointAt(0) ?? 0).length;
      while (i < source.length && continuesText(source, i)) i++;
      return capture(source.slice(0, i));
    },
    parse: ([content]) => ({ type: `text`, content })
  }
};

const fullRuleSet: readonly RuleName[] = [
  `heading`,
  `subtext`,
  `codeBlock`,
  `blockQuote`,
  `list`,
  `lineBreak`,
  `escape`,
  `autolink`,
  `url`,
  `maskedLink`,
  `userMention`,
  `roleMention`,
  `channelMention`,
  `commandMention`,
  `guildNavigation`,
  `timestamp`,
  `customEmoji`,
  `globalMention`,
  `italic`,
  `bold`,
  `underline`,
  `strikethrough`,
  `spoiler`,
  `inlineCode`,
  `emoji`,
  `text`
];

/**
 * Which rules apply where, as data. From the spec's section 6, which took it from Discohook's per-context rule map; it is to be confirmed against the live client.
 *
 * - `full`: message content, text displays, embed descriptions.
 * - `fieldValue`: embed field values, which do not render headings.
 * - `reduced`: embed titles, field names, author names and footers: inline styles, inline code, links, spoilers, timestamps, channel mentions and emoji. User and role mentions stay literal text there.
 */
export const ruleSets = {
  full: fullRuleSet,
  fieldValue: fullRuleSet.filter((name) => name !== `heading`),
  reduced: [
    `lineBreak`,
    `escape`,
    `autolink`,
    `url`,
    `maskedLink`,
    `channelMention`,
    `timestamp`,
    `customEmoji`,
    `italic`,
    `bold`,
    `underline`,
    `strikethrough`,
    `spoiler`,
    `inlineCode`,
    `emoji`,
    `text`
  ]
} as const satisfies Record<string, readonly RuleName[]>;

export type RuleSetName = keyof typeof ruleSets;
