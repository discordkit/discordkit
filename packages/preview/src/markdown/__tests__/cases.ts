import type {
  CodeBlockNode,
  CommandMentionNode,
  CustomEmojiNode,
  EmojiNode,
  GuildNavigationNode,
  LineBreakNode,
  LinkNode,
  ListNode,
  MarkdownNode,
  TextNode,
  TimestampNode,
  TimestampStyle
} from "../ast.js";
import type { MarkdownContext } from "../parse.js";

/**
 * Behavioural cases for the markdown parser, kept as data so the same strings can be posted to a real Discord channel and compared (calibration, spec section 7). Each case says where its expected result comes from:
 *
 * - `observed`: seen in the real client by the authors of the bots this package serves. Ground truth.
 * - `documented`: stated in Discord's developer documentation (the "Message Formatting" section of the API reference), which covers token syntax and says little about markdown.
 * - `assumed`: what an engine following simple-markdown's algorithm does, or the most likely behaviour where that does not decide it. Not seen in the client. These are what calibration has to check: filter this list on `provenance === "assumed"`.
 *
 * `note` says why a case matters or what the assumption rests on, where the name does not.
 */

export type Provenance = `observed` | `documented` | `assumed`;

export interface MarkdownCase {
  name: string;
  source: string;
  context: MarkdownContext;
  expected: MarkdownNode[];
  provenance: Provenance;
  note?: string;
}

const t = (content: string): TextNode => ({ type: `text`, content });
const br: LineBreakNode = { type: `lineBreak` };
const h = (level: 1 | 2 | 3, ...content: MarkdownNode[]): MarkdownNode => ({
  type: `heading`,
  level,
  content
});
const sub = (...content: MarkdownNode[]): MarkdownNode => ({
  type: `subtext`,
  content
});
const quote = (...content: MarkdownNode[]): MarkdownNode => ({
  type: `blockQuote`,
  content
});
const ul = (...items: MarkdownNode[][]): ListNode => ({
  type: `list`,
  ordered: false,
  items
});
const ol = (start: number, ...items: MarkdownNode[][]): ListNode => ({
  type: `list`,
  ordered: true,
  start,
  items
});
const codeBlock = (content: string, lang?: string): CodeBlockNode =>
  lang === undefined
    ? { type: `codeBlock`, content }
    : { type: `codeBlock`, lang, content };
const code = (content: string): MarkdownNode => ({
  type: `inlineCode`,
  content
});
const b = (...content: MarkdownNode[]): MarkdownNode => ({
  type: `bold`,
  content
});
const i = (...content: MarkdownNode[]): MarkdownNode => ({
  type: `italic`,
  content
});
const u = (...content: MarkdownNode[]): MarkdownNode => ({
  type: `underline`,
  content
});
const s = (...content: MarkdownNode[]): MarkdownNode => ({
  type: `strikethrough`,
  content
});
const spoiler = (...content: MarkdownNode[]): MarkdownNode => ({
  type: `spoiler`,
  content
});
const url = (target: string): LinkNode => ({
  type: `link`,
  target,
  content: [t(target)],
  masked: false,
  suppressEmbed: false
});
const autolink = (target: string): LinkNode => ({
  ...url(target),
  suppressEmbed: true
});
const masked = (
  target: string,
  content: MarkdownNode[],
  options: { suppressEmbed?: boolean; title?: string } = {}
): LinkNode => ({
  type: `link`,
  target,
  content,
  masked: true,
  suppressEmbed: options.suppressEmbed ?? false,
  ...(options.title === undefined ? {} : { title: options.title })
});
const user = (id: string): MarkdownNode => ({ type: `userMention`, id });
const role = (id: string): MarkdownNode => ({ type: `roleMention`, id });
const channel = (id: string): MarkdownNode => ({ type: `channelMention`, id });
const command = (name: string, id: string): CommandMentionNode => ({
  type: `commandMention`,
  name,
  id
});
const nav = (
  target: GuildNavigationNode[`target`],
  roleId?: string
): GuildNavigationNode =>
  roleId === undefined
    ? { type: `guildNavigation`, target }
    : { type: `guildNavigation`, target, roleId };
const time = (timestamp: number, style: TimestampStyle): TimestampNode => ({
  type: `timestamp`,
  timestamp,
  style
});
const customEmoji = (
  name: string,
  id: string,
  animated = false
): CustomEmojiNode => ({ type: `customEmoji`, name, id, animated });
const emoji = (value: string): EmojiNode => ({ type: `emoji`, value });

const timestampStyles: TimestampStyle[] = [
  `t`,
  `T`,
  `d`,
  `D`,
  `f`,
  `F`,
  `s`,
  `S`,
  `R`
];

/** Seen in the real client. */
const observed: MarkdownCase[] = [
  {
    name: `a heading styles exactly one line`,
    source: `# Round 3\nPick a hero`,
    context: `message`,
    expected: [h(1, t(`Round 3`)), t(`Pick a hero`)],
    provenance: `observed`,
    note: `Cost real iterations in both bots: the line after a heading is ordinary body text. The heading consumes its newline, so no empty line sits between them either.`
  },
  {
    name: `subtext needs a space after -#`,
    source: `-#tiny`,
    context: `message`,
    expected: [t(`-#tiny`)],
    provenance: `observed`,
    note: `Without the space the marker is shown literally, which is what an author sees when they forget it.`
  },
  {
    name: `-# with a space is subtext`,
    source: `-# Updated every hour`,
    context: `message`,
    expected: [sub(t(`Updated every hour`))],
    provenance: `observed`,
    note: `Both bots ship subtext lines; this is the positive side of the case above.`
  },
  {
    name: `a block quote ends at the newline`,
    source: `> quoted\nnot quoted`,
    context: `message`,
    expected: [quote(t(`quoted`)), t(`not quoted`)],
    provenance: `observed`,
    note: `Unlike CommonMark, a following line without \`>\` does not join the quote.`
  },
  {
    name: `a block quote continues while each line starts with >`,
    source: `> one\n> two\nthree`,
    context: `message`,
    expected: [quote(t(`one`), br, t(`two`)), t(`three`)],
    provenance: `observed`
  },
  {
    name: `>>> quotes everything to the end of the message`,
    source: `>>> one\ntwo\n\nthree`,
    context: `message`,
    expected: [quote(t(`one`), br, t(`two`), br, br, t(`three`))],
    provenance: `observed`
  },
  {
    name: `bold inside a heading is still bold`,
    source: `## **Round** 3`,
    context: `message`,
    expected: [h(2, b(t(`Round`)), t(` 3`))],
    provenance: `observed`,
    note: `It looks no different because the heading is already bold, but the tree must keep it: lint and the renderer cannot tell it was written otherwise.`
  },
  {
    name: `double underscores are underline`,
    source: `__underlined__`,
    context: `message`,
    expected: [u(t(`underlined`))],
    provenance: `observed`,
    note: `In CommonMark this would be bold.`
  },
  {
    name: `single underscores are italic`,
    source: `_slanted_`,
    context: `message`,
    expected: [i(t(`slanted`))],
    provenance: `observed`
  },
  {
    name: `a masked link in angle brackets suppresses its preview`,
    source: `[the docs](<https://discord.com/developers/docs>)`,
    context: `message`,
    expected: [
      masked(`https://discord.com/developers/docs`, [t(`the docs`)], {
        suppressEmbed: true
      })
    ],
    provenance: `observed`
  },
  {
    name: `a user mention in an embed title stays literal`,
    source: `Winner: <@80351110224678912>`,
    context: `embedTitle`,
    expected: [t(`Winner: <@80351110224678912>`)],
    provenance: `observed`
  },
  {
    name: `Japanese text with full-width punctuation passes through`,
    source: `これは、テストです。（全角）「引用」！`,
    context: `message`,
    expected: [t(`これは、テストです。（全角）「引用」！`)],
    provenance: `observed`
  },
  {
    name: `the full-width underscore is not an italic delimiter`,
    source: `＿強調ではない＿`,
    context: `message`,
    expected: [t(`＿強調ではない＿`)],
    provenance: `observed`
  }
];

/** Token syntax from the API reference's "Message Formatting" section. */
const documented: MarkdownCase[] = [
  {
    name: `user mention`,
    source: `<@80351110224678912>`,
    context: `message`,
    expected: [user(`80351110224678912`)],
    provenance: `documented`
  },
  {
    name: `deprecated user mention with !`,
    source: `<@!80351110224678912>`,
    context: `message`,
    expected: [user(`80351110224678912`)],
    provenance: `documented`,
    note: `The docs say to handle it like any other user mention, so the tree does not record the \`!\`.`
  },
  {
    name: `role mention`,
    source: `<@&165511591545143296>`,
    context: `message`,
    expected: [role(`165511591545143296`)],
    provenance: `documented`
  },
  {
    name: `channel mention`,
    source: `<#103735883630395392>`,
    context: `message`,
    expected: [channel(`103735883630395392`)],
    provenance: `documented`
  },
  {
    name: `slash command mention`,
    source: `</airhorn:816437322781949972>`,
    context: `message`,
    expected: [command(`airhorn`, `816437322781949972`)],
    provenance: `documented`
  },
  {
    name: `slash command mention with a subcommand`,
    source: `</foo bar:123456789012345678>`,
    context: `message`,
    expected: [command(`foo bar`, `123456789012345678`)],
    provenance: `documented`
  },
  {
    name: `slash command mention with a subcommand group`,
    source: `</foo group bar:123456789012345678>`,
    context: `message`,
    expected: [command(`foo group bar`, `123456789012345678`)],
    provenance: `documented`
  },
  {
    name: `custom emoji`,
    source: `<:mmLol:216154654256398347>`,
    context: `message`,
    expected: [customEmoji(`mmLol`, `216154654256398347`)],
    provenance: `documented`
  },
  {
    name: `animated custom emoji`,
    source: `<a:b1nzy:392938283556143104>`,
    context: `message`,
    expected: [customEmoji(`b1nzy`, `392938283556143104`, true)],
    provenance: `documented`
  },
  {
    name: `timestamp without a style uses f`,
    source: `<t:1618953630>`,
    context: `message`,
    expected: [time(1618953630, `f`)],
    provenance: `documented`,
    note: `The docs mark \`f\` as the default style.`
  },
  ...timestampStyles.map((style): MarkdownCase => ({
    name: `timestamp with style ${style}`,
    source: `<t:1618953630:${style}>`,
    context: `message`,
    expected: [time(1618953630, style)],
    provenance: `documented`
  })),
  ...([`customize`, `browse`, `guide`, `linked-roles`] as const).map(
    (target): MarkdownCase => ({
      name: `guild navigation to ${target}`,
      source: `<id:${target}>`,
      context: `message`,
      expected: [nav(target)],
      provenance: `documented`
    })
  ),
  {
    name: `guild navigation to one linked role`,
    source: `<id:linked-roles:1234567890123456789>`,
    context: `message`,
    expected: [nav(`linked-roles`, `1234567890123456789`)],
    provenance: `documented`
  },
  {
    name: `a Unicode emoji is its own node`,
    source: `🪴 plant`,
    context: `message`,
    expected: [emoji(`🪴`), t(` plant`)],
    provenance: `documented`,
    note: `The docs say standard emoji are drawn with Twemoji on desktop, so the renderer needs each emoji separate from the text around it.`
  }
];

/** The coordinator's list of behaviours where CommonMark-style parsers (including Mirrordown) disagree with a simple-markdown style engine. */
const commonMarkDifferences: MarkdownCase[] = [
  {
    name: `a spoiler may have spaces inside its pipes`,
    source: `|| the butler ||`,
    context: `message`,
    expected: [spoiler(t(` the butler `))],
    provenance: `assumed`,
    note: `CommonMark-style flanking rules leave this literal. A lazy pattern tried at the current position does not look at neighbouring characters.`
  },
  {
    name: `a spoiler spans a blank line`,
    source: `||first\n\nsecond||`,
    context: `message`,
    expected: [spoiler(t(`first`), br, br, t(`second`))],
    provenance: `assumed`,
    note: `Discord has no paragraphs to split the span at.`
  },
  {
    name: `bold spans a blank line`,
    source: `**first\n\nsecond**`,
    context: `message`,
    expected: [b(t(`first`), br, br, t(`second`))],
    provenance: `assumed`
  },
  {
    name: `bold may have spaces inside its asterisks`,
    source: `** bold **`,
    context: `message`,
    expected: [b(t(` bold `))],
    provenance: `assumed`
  },
  {
    name: `bold closes before Japanese text`,
    source: `**テスト。**テスト`,
    context: `message`,
    expected: [b(t(`テスト。`)), t(`テスト`)],
    provenance: `assumed`,
    note: `The tool's first user writes Japanese. CommonMark's flanking rules refuse to close after punctuation that is followed by a letter, and leave this literal.`
  },
  {
    name: `bold around a bracketed Japanese phrase`,
    source: `これは**「重要」**です`,
    context: `message`,
    expected: [t(`これは`), b(t(`「重要」`)), t(`です`)],
    provenance: `assumed`,
    note: `Same reason: the delimiters sit between a letter and punctuation on both sides.`
  },
  {
    name: `blank lines are kept`,
    source: `one\n\n\ntwo`,
    context: `message`,
    expected: [t(`one`), br, br, br, t(`two`)],
    provenance: `assumed`,
    note: `Every newline is a node, so a renderer can reproduce the spacing an author typed.`
  },
  {
    name: `four hashes are not a heading`,
    source: `#### four`,
    context: `message`,
    expected: [t(`#### four`)],
    provenance: `assumed`
  },
  {
    name: `a line of three hyphens is not a rule`,
    source: `above\n---\nbelow`,
    context: `message`,
    expected: [t(`above`), br, t(`---`), br, t(`below`)],
    provenance: `assumed`,
    note: `In CommonMark \`---\` under a line also makes the line a heading.`
  },
  {
    name: `four leading spaces are not a code block`,
    source: `    indented`,
    context: `message`,
    expected: [t(`    indented`)],
    provenance: `assumed`
  },
  {
    name: `an HTML entity stays as written`,
    source: `fish &amp; chips`,
    context: `message`,
    expected: [t(`fish &amp; chips`)],
    provenance: `assumed`
  },
  {
    name: `triple backticks in the middle of a line make a code block`,
    source: `before \`\`\`code\`\`\` after`,
    context: `message`,
    expected: [t(`before `), codeBlock(`code`), t(` after`)],
    provenance: `assumed`,
    note: `Discord's code block rule is not tied to the start of a line.`
  }
];

/** Inputs taken from Mirrordown's spoiler tests. Mirrordown's expected results describe a different algorithm and are not used; these are what a simple-markdown style engine does. */
const spoilerEdgeCases: MarkdownCase[] = [
  {
    name: `an odd run of pipes leaves the extra pipe after the spoiler`,
    source: `|||a|||`,
    context: `message`,
    expected: [spoiler(t(`|a`)), t(`|`)],
    provenance: `assumed`,
    note: `The lazy match closes at the first \`||\` after at least one character of content, so the third opening pipe becomes content.`
  },
  {
    name: `a closer pairs with the first opener, not the nearest`,
    source: `||a ||b||`,
    context: `message`,
    expected: [spoiler(t(`a `)), t(`b||`)],
    provenance: `assumed`,
    note: `CommonMark-style pairing would hide only \`b\`; a pattern tried at the current position hides \`a \` instead.`
  },
  {
    name: `spoilers do not nest`,
    source: `||a ||b|| c||`,
    context: `message`,
    expected: [spoiler(t(`a `)), t(`b`), spoiler(t(` c`))],
    provenance: `assumed`
  },
  {
    name: `a run of three pipes between words`,
    source: `||a ||| b||`,
    context: `message`,
    expected: [spoiler(t(`a `)), t(`| b||`)],
    provenance: `assumed`
  },
  {
    name: `four pipes with nothing between are text`,
    source: `||||`,
    context: `message`,
    expected: [t(`||||`)],
    provenance: `assumed`
  },
  {
    name: `an unclosed spoiler is text`,
    source: `foo ||bar`,
    context: `message`,
    expected: [t(`foo ||bar`)],
    provenance: `assumed`
  },
  {
    name: `a spoiler inside a word`,
    source: `foo||bar||baz`,
    context: `message`,
    expected: [t(`foo`), spoiler(t(`bar`)), t(`baz`)],
    provenance: `assumed`
  },
  {
    name: `a space after the opening pipes does not stop a spoiler`,
    source: `|| leading space||`,
    context: `message`,
    expected: [spoiler(t(` leading space`))],
    provenance: `assumed`
  },
  {
    name: `an escaped opening pipe leaves the whole thing literal`,
    source: String.raw`\||not hidden||`,
    context: `message`,
    expected: [t(`||not hidden||`)],
    provenance: `assumed`,
    note: `The escape turns the first pipe into text, and a single pipe cannot open.`
  },
  {
    name: `an escaped closing pipe keeps the spoiler from closing`,
    source: String.raw`||text\||`,
    context: `message`,
    expected: [t(`||text||`)],
    provenance: `assumed`,
    note: `Rests on the spoiler pattern skipping escaped characters, as bold's does. If Discord's spoiler pattern is a plain lazy match, this is a spoiler holding \`text\\\` instead.`
  },
  {
    name: `an escaped backslash does not escape the pipes`,
    source: String.raw`\\||text||`,
    context: `message`,
    expected: [t(`\\`), spoiler(t(`text`))],
    provenance: `assumed`
  },
  {
    name: `escaped pipes on both sides are literal`,
    source: String.raw`\|\|x\|\|`,
    context: `message`,
    expected: [t(`||x||`)],
    provenance: `assumed`
  },
  {
    name: `a spoiler that crosses italics wins, because it starts first`,
    source: `||a *b|| c*`,
    context: `message`,
    expected: [spoiler(t(`a *b`)), t(` c*`)],
    provenance: `assumed`
  },
  {
    name: `italics that cross a spoiler win, because they start first`,
    source: `*a ||b* c||`,
    context: `message`,
    expected: [i(t(`a ||b`)), t(` c||`)],
    provenance: `assumed`
  },
  {
    name: `a spoiler around bold`,
    source: `||**bold spoiler**||`,
    context: `message`,
    expected: [spoiler(b(t(`bold spoiler`)))],
    provenance: `assumed`
  },
  {
    name: `a spoiler inside bold`,
    source: `**||spoiler inside bold||**`,
    context: `message`,
    expected: [b(spoiler(t(`spoiler inside bold`)))],
    provenance: `assumed`
  },
  {
    name: `a spoiler around inline code`,
    source: `||\`secret_value\`||`,
    context: `message`,
    expected: [spoiler(code(`secret_value`))],
    provenance: `assumed`
  },
  {
    name: `a spoiler in a heading`,
    source: `## ||spoiler heading||`,
    context: `message`,
    expected: [h(2, spoiler(t(`spoiler heading`)))],
    provenance: `assumed`
  },
  {
    name: `a spoiler in a block quote`,
    source: `> ||quoted secret||`,
    context: `message`,
    expected: [quote(spoiler(t(`quoted secret`)))],
    provenance: `assumed`
  },
  {
    name: `a spoiler inside a masked link's label`,
    source: `[||hidden label||](https://example.com)`,
    context: `message`,
    expected: [masked(`https://example.com`, [spoiler(t(`hidden label`))])],
    provenance: `assumed`
  },
  {
    name: `pipes inside an autolink are part of the URL`,
    source: `<https://x.com/||b||>`,
    context: `message`,
    expected: [autolink(`https://x.com/||b||`)],
    provenance: `assumed`
  },
  {
    name: `lone pipes are text`,
    source: `a | b then c | d`,
    context: `message`,
    expected: [t(`a | b then c | d`)],
    provenance: `assumed`
  }
];

/** The rest of the constructs, each in the contexts where it behaves differently. */
const constructs: MarkdownCase[] = [
  // Emphasis.
  {
    name: `single asterisks are italic`,
    source: `*slanted*`,
    context: `message`,
    expected: [i(t(`slanted`))],
    provenance: `assumed`
  },
  {
    name: `triple asterisks are italic around bold`,
    source: `***both***`,
    context: `message`,
    expected: [i(b(t(`both`)))],
    provenance: `assumed`,
    note: `simple-markdown's tie-break: italic and bold match the same length, and italic's quality bonus wins.`
  },
  {
    name: `italic asterisks need a non-space just inside`,
    source: `this * is not * italic`,
    context: `message`,
    expected: [t(`this * is not * italic`)],
    provenance: `assumed`,
    note: `simple-markdown's \`em\` refuses a space after the opening \`*\` and before the closing one, unlike \`**\`. (At the start of a line, \`* \` would begin a list instead.)`
  },
  {
    name: `multiplication is not italic`,
    source: `2 * 3 * 4`,
    context: `message`,
    expected: [t(`2 * 3 * 4`)],
    provenance: `assumed`
  },
  {
    name: `underscores inside a word do not italicise`,
    source: `snake_case_name`,
    context: `message`,
    expected: [t(`snake_case_name`)],
    provenance: `assumed`,
    note: `The \`_\` form needs a word boundary after the closing underscore.`
  },
  {
    name: `an underscore pair that ends a word italicises even after letters`,
    source: `foo_bar_ baz`,
    context: `message`,
    expected: [t(`foo`), i(t(`bar`)), t(` baz`)],
    provenance: `assumed`,
    note: `simple-markdown checks the boundary only after the closing underscore; the text before the opening one was already consumed.`
  },
  {
    name: `underscores between Japanese words italicise`,
    source: `テスト_強調_テスト`,
    context: `message`,
    expected: [t(`テスト`), i(t(`強調`)), t(`テスト`)],
    provenance: `assumed`,
    note: `The boundary check is ASCII-only, so a CJK character after the closing underscore counts as a word boundary.`
  },
  {
    name: `strikethrough`,
    source: `~~struck~~`,
    context: `message`,
    expected: [s(t(`struck`))],
    provenance: `assumed`
  },
  {
    name: `strikethrough may have spaces inside its tildes`,
    source: `~~ struck ~~`,
    context: `message`,
    expected: [s(t(` struck `))],
    provenance: `assumed`,
    note: `simple-markdown's \`del\` refuses this; assumed Discord's strikethrough works like its bold.`
  },
  {
    name: `nested emphasis of every kind`,
    source: `**__*~~||deep||~~*__**`,
    context: `message`,
    expected: [b(u(i(s(spoiler(t(`deep`))))))],
    provenance: `assumed`
  },
  {
    name: `inline styles in an embed title`,
    source: `**Bold** _it_ __u__ ~~s~~ ||sp||`,
    context: `embedTitle`,
    expected: [
      b(t(`Bold`)),
      t(` `),
      i(t(`it`)),
      t(` `),
      u(t(`u`)),
      t(` `),
      s(t(`s`)),
      t(` `),
      spoiler(t(`sp`))
    ],
    provenance: `assumed`
  },
  {
    name: `inline styles in an embed footer`,
    source: `**Bold** footer`,
    context: `embedFooter`,
    expected: [b(t(`Bold`)), t(` footer`)],
    provenance: `assumed`,
    note: `Follows the spec's table. Possibly wrong: footers and author names may render no markdown at all.`
  },
  // Inline code.
  {
    name: `inline code`,
    source: `run \`vp check\` first`,
    context: `message`,
    expected: [t(`run `), code(`vp check`), t(` first`)],
    provenance: `assumed`
  },
  {
    name: `nothing inside inline code is parsed`,
    source: `\`**<@123>**\``,
    context: `message`,
    expected: [code(`**<@123>**`)],
    provenance: `assumed`
  },
  {
    name: `double backticks can hold a backtick`,
    source: `\`\` \`tick\` \`\``,
    context: `message`,
    expected: [code(`\`tick\``)],
    provenance: `assumed`,
    note: `simple-markdown drops one space of padding next to a backtick.`
  },
  {
    name: `inline code in an embed title`,
    source: `\`code\``,
    context: `embedTitle`,
    expected: [code(`code`)],
    provenance: `assumed`
  },
  // Escapes.
  {
    name: `escaped asterisks are literal`,
    source: String.raw`\*not italic\*`,
    context: `message`,
    expected: [t(`*not italic*`)],
    provenance: `assumed`
  },
  {
    name: `a backslash before a letter is shown`,
    source: String.raw`C:\Users`,
    context: `message`,
    expected: [t(String.raw`C:\Users`)],
    provenance: `assumed`,
    note: `Letters, digits and whitespace cannot be escaped, so backslashes in prose survive.`
  },
  {
    name: `an escaped mention is literal`,
    source: String.raw`\<@80351110224678912>`,
    context: `message`,
    expected: [t(`<@80351110224678912>`)],
    provenance: `assumed`
  },
  {
    name: `an escaped Unicode emoji is text`,
    source: String.raw`\😀`,
    context: `message`,
    expected: [t(`😀`)],
    provenance: `assumed`,
    note: `Assumed to render as a font glyph rather than an image, which is the usual reason to escape one.`
  },
  // Links.
  {
    name: `masked link`,
    source: `[the docs](https://discord.com/developers/docs)`,
    context: `message`,
    expected: [masked(`https://discord.com/developers/docs`, [t(`the docs`)])],
    provenance: `assumed`
  },
  {
    name: `masked link with a title`,
    source: `[docs](https://discord.com "Discord")`,
    context: `message`,
    expected: [
      masked(`https://discord.com`, [t(`docs`)], { title: `Discord` })
    ],
    provenance: `assumed`
  },
  {
    name: `masked link label keeps its formatting`,
    source: `[**docs**](https://discord.com)`,
    context: `message`,
    expected: [masked(`https://discord.com`, [b(t(`docs`))])],
    provenance: `assumed`
  },
  {
    name: `a URL in a masked link's label is not a second link`,
    source: `[https://a.example](https://b.example)`,
    context: `message`,
    expected: [masked(`https://b.example`, [t(`https://a.example`)])],
    provenance: `assumed`
  },
  {
    name: `a masked link to a non-web URL is text`,
    source: `[click](javascript:alert)`,
    context: `message`,
    expected: [t(`[click](javascript:alert)`)],
    provenance: `assumed`
  },
  {
    name: `masked link in an embed title`,
    source: `[docs](https://discord.com)`,
    context: `embedTitle`,
    expected: [masked(`https://discord.com`, [t(`docs`)])],
    provenance: `assumed`
  },
  {
    name: `bare URL, leaving out a trailing full stop`,
    source: `see https://discord.com.`,
    context: `message`,
    expected: [t(`see `), url(`https://discord.com`), t(`.`)],
    provenance: `assumed`
  },
  {
    name: `bare URL ending in a closing parenthesis`,
    source: `https://en.wikipedia.org/wiki/Bot_(disambiguation)`,
    context: `message`,
    expected: [
      url(`https://en.wikipedia.org/wiki/Bot_(disambiguation`),
      t(`)`)
    ],
    provenance: `assumed`,
    note: `simple-markdown's URL pattern never ends a URL on \`)\`. Discord's client may balance parentheses instead.`
  },
  {
    name: `autolink in angle brackets suppresses its preview`,
    source: `<https://discord.com>`,
    context: `message`,
    expected: [autolink(`https://discord.com`)],
    provenance: `assumed`
  },
  {
    name: `bare URL in an embed title`,
    source: `https://discord.com`,
    context: `embedTitle`,
    expected: [url(`https://discord.com`)],
    provenance: `assumed`
  },
  // Line breaks.
  {
    name: `a newline is a line break`,
    source: `a\nb`,
    context: `message`,
    expected: [t(`a`), br, t(`b`)],
    provenance: `assumed`
  },
  {
    name: `Windows line endings are one line break`,
    source: `a\r\nb`,
    context: `message`,
    expected: [t(`a`), br, t(`b`)],
    provenance: `assumed`
  },
  // Headings.
  {
    name: `heading level 2`,
    source: `## Two`,
    context: `message`,
    expected: [h(2, t(`Two`))],
    provenance: `assumed`
  },
  {
    name: `heading level 3`,
    source: `### Three`,
    context: `message`,
    expected: [h(3, t(`Three`))],
    provenance: `assumed`
  },
  {
    name: `a hash without a space is not a heading`,
    source: `#hashtag`,
    context: `message`,
    expected: [t(`#hashtag`)],
    provenance: `assumed`
  },
  {
    name: `a hash in the middle of a line is not a heading`,
    source: `a # b`,
    context: `message`,
    expected: [t(`a # b`)],
    provenance: `assumed`
  },
  {
    name: `closing hashes are dropped from a heading`,
    source: `# I love C#`,
    context: `message`,
    expected: [h(1, t(`I love C`))],
    provenance: `assumed`,
    note: `simple-markdown strips a closing run of \`#\`. If Discord does too, a heading ending in C# loses its hash.`
  },
  {
    name: `a heading after a line of text`,
    source: `intro\n# Title`,
    context: `message`,
    expected: [t(`intro`), br, h(1, t(`Title`))],
    provenance: `assumed`
  },
  {
    name: `no heading in an embed field value`,
    source: `# Not a heading`,
    context: `embedFieldValue`,
    expected: [t(`# Not a heading`)],
    provenance: `assumed`
  },
  {
    name: `a heading in an embed description`,
    source: `# Heading`,
    context: `embedDescription`,
    expected: [h(1, t(`Heading`))],
    provenance: `assumed`
  },
  {
    name: `no heading in an embed title`,
    source: `# Not a heading`,
    context: `embedTitle`,
    expected: [t(`# Not a heading`)],
    provenance: `assumed`
  },
  // Subtext.
  {
    name: `subtext in an embed field value`,
    source: `-# small print`,
    context: `embedFieldValue`,
    expected: [sub(t(`small print`))],
    provenance: `assumed`,
    note: `The spec removes only headings from field values.`
  },
  {
    name: `no subtext in an embed title`,
    source: `-# small print`,
    context: `embedTitle`,
    expected: [t(`-# small print`)],
    provenance: `assumed`
  },
  // Block quotes.
  {
    name: `a quote needs a space after >`,
    source: `>no space`,
    context: `message`,
    expected: [t(`>no space`)],
    provenance: `assumed`
  },
  {
    name: `a bare > line ends a quote`,
    source: `> a\n>\n> b`,
    context: `message`,
    expected: [quote(t(`a`)), t(`>`), br, quote(t(`b`))],
    provenance: `assumed`
  },
  {
    name: `quotes do not nest`,
    source: `> > nested`,
    context: `message`,
    expected: [quote(t(`> nested`))],
    provenance: `assumed`
  },
  {
    name: `a heading inside a quote`,
    source: `> # Title\n> body`,
    context: `message`,
    expected: [quote(h(1, t(`Title`)), t(`body`))],
    provenance: `assumed`
  },
  {
    name: `> in the middle of a line is not a quote`,
    source: `a > b`,
    context: `message`,
    expected: [t(`a > b`)],
    provenance: `assumed`
  },
  {
    name: `no quote in an embed title`,
    source: `> quoted`,
    context: `embedTitle`,
    expected: [t(`> quoted`)],
    provenance: `assumed`
  },
  // Code blocks.
  {
    name: `code block with a language`,
    source: `\`\`\`ts\nconst a = 1;\n\`\`\``,
    context: `message`,
    expected: [codeBlock(`const a = 1;`, `ts`)],
    provenance: `assumed`
  },
  {
    name: `a language needs a newline after it`,
    source: `\`\`\`ts const a\`\`\``,
    context: `message`,
    expected: [codeBlock(`ts const a`)],
    provenance: `assumed`
  },
  {
    name: `nothing inside a code block is parsed`,
    source: `\`\`\`\n**not bold** <@123>\n\`\`\``,
    context: `message`,
    expected: [codeBlock(`**not bold** <@123>`)],
    provenance: `assumed`
  },
  {
    name: `a code block consumes its closing newline`,
    source: `\`\`\`\nx\n\`\`\`\nnext`,
    context: `message`,
    expected: [codeBlock(`x`), t(`next`)],
    provenance: `assumed`
  },
  {
    name: `triple backticks in an embed title are inline code`,
    source: `\`\`\`x\`\`\``,
    context: `embedTitle`,
    expected: [code(`x`)],
    provenance: `assumed`
  },
  // Lists.
  {
    name: `bulleted list with hyphens`,
    source: `- one\n- two`,
    context: `message`,
    expected: [ul([t(`one`)], [t(`two`)])],
    provenance: `assumed`
  },
  {
    name: `bulleted list with asterisks`,
    source: `* star`,
    context: `message`,
    expected: [ul([t(`star`)])],
    provenance: `assumed`
  },
  {
    name: `numbered list`,
    source: `1. first\n2. second`,
    context: `message`,
    expected: [ol(1, [t(`first`)], [t(`second`)])],
    provenance: `assumed`
  },
  {
    name: `numbered list keeps its first number`,
    source: `3. third`,
    context: `message`,
    expected: [ol(3, [t(`third`)])],
    provenance: `assumed`
  },
  {
    name: `nested list`,
    source: `- outer\n  - inner\n- next`,
    context: `message`,
    expected: [ul([t(`outer`), br, ul([t(`inner`)])], [t(`next`)])],
    provenance: `assumed`,
    note: `The newline between an item's text and its nested list stays in the tree, as it does before any line-level construct.`
  },
  {
    name: `a line without a bullet ends a list`,
    source: `- item\nafter`,
    context: `message`,
    expected: [ul([t(`item`)]), t(`after`)],
    provenance: `assumed`,
    note: `simple-markdown would make \`after\` part of the item; assumed Discord, which parses a message as one run of lines, ends the list here.`
  },
  {
    name: `a hyphen without a space is not a bullet`,
    source: `-item`,
    context: `message`,
    expected: [t(`-item`)],
    provenance: `assumed`
  },
  {
    name: `a plus sign is not a bullet`,
    source: `+ plus`,
    context: `message`,
    expected: [t(`+ plus`)],
    provenance: `assumed`
  },
  {
    name: `no list in an embed title`,
    source: `- item`,
    context: `embedTitle`,
    expected: [t(`- item`)],
    provenance: `assumed`
  },
  // Mentions.
  {
    name: `@everyone and @here`,
    source: `@everyone and @here`,
    context: `message`,
    expected: [
      { type: `globalMention`, target: `everyone` },
      t(` and `),
      { type: `globalMention`, target: `here` }
    ],
    provenance: `assumed`
  },
  {
    name: `user mention in an embed field value`,
    source: `<@80351110224678912>`,
    context: `embedFieldValue`,
    expected: [user(`80351110224678912`)],
    provenance: `assumed`
  },
  {
    name: `role mention in an embed title stays literal`,
    source: `<@&165511591545143296>`,
    context: `embedTitle`,
    expected: [t(`<@&165511591545143296>`)],
    provenance: `assumed`
  },
  {
    name: `@everyone in an embed title stays literal`,
    source: `@everyone`,
    context: `embedTitle`,
    expected: [t(`@everyone`)],
    provenance: `assumed`
  },
  {
    name: `channel mention in an embed title`,
    source: `<#103735883630395392>`,
    context: `embedTitle`,
    expected: [channel(`103735883630395392`)],
    provenance: `assumed`
  },
  {
    name: `slash command mention in an embed title stays literal`,
    source: `</airhorn:816437322781949972>`,
    context: `embedTitle`,
    expected: [t(`</airhorn:816437322781949972>`)],
    provenance: `assumed`
  },
  {
    name: `a slash command mention with four name parts is text`,
    source: `</a b c d:123>`,
    context: `message`,
    expected: [t(`</a b c d:123>`)],
    provenance: `assumed`
  },
  {
    name: `guild navigation in an embed title stays literal`,
    source: `<id:browse>`,
    context: `embedTitle`,
    expected: [t(`<id:browse>`)],
    provenance: `assumed`
  },
  {
    name: `only linked-roles takes a role id`,
    source: `<id:browse:123>`,
    context: `message`,
    expected: [t(`<id:browse:123>`)],
    provenance: `assumed`
  },
  // Timestamps.
  {
    name: `an unknown timestamp style is text`,
    source: `<t:1618953630:x>`,
    context: `message`,
    expected: [t(`<t:1618953630:x>`)],
    provenance: `assumed`
  },
  {
    name: `timestamp in an embed title`,
    source: `<t:1618953630:R>`,
    context: `embedTitle`,
    expected: [time(1618953630, `R`)],
    provenance: `assumed`
  },
  // Emoji.
  {
    name: `custom emoji in an embed title`,
    source: `<:mmLol:216154654256398347>`,
    context: `embedTitle`,
    expected: [customEmoji(`mmLol`, `216154654256398347`)],
    provenance: `assumed`
  },
  {
    name: `emoji sequences stay whole`,
    source: `👍🏽👨‍👩‍👧🇯🇵1️⃣`,
    context: `message`,
    expected: [emoji(`👍🏽`), emoji(`👨‍👩‍👧`), emoji(`🇯🇵`), emoji(`1️⃣`)],
    provenance: `assumed`,
    note: `A skin tone, a joined family, a flag and a keycap each draw as one image.`
  },
  {
    name: `an emoji between Japanese words`,
    source: `日本🇯🇵語`,
    context: `message`,
    expected: [t(`日本`), emoji(`🇯🇵`), t(`語`)],
    provenance: `assumed`
  },
  {
    name: `a heart without the emoji variation selector is text`,
    source: `❤ ©`,
    context: `message`,
    expected: [t(`❤ ©`)],
    provenance: `assumed`,
    note: `Emoji are detected with Unicode's RGI_Emoji set, which leaves out characters that default to text presentation. Discord may draw these as Twemoji anyway.`
  },
  {
    name: `Unicode emoji in an embed title`,
    source: `🪴`,
    context: `embedTitle`,
    expected: [emoji(`🪴`)],
    provenance: `assumed`
  },
  // Unterminated delimiters.
  ...(
    [
      [`bold`, `**bold`],
      [`italic`, `*italic`],
      [`underline`, `__under`],
      [`strikethrough`, `~~struck`],
      [`inline code`, `\`code`],
      [`mention`, `<@80351110224678912`],
      [`timestamp`, `<t:1618953630:R`]
    ] as const
  ).map(([what, source]): MarkdownCase => ({
    name: `an unterminated ${what} is text`,
    source,
    context: `message`,
    expected: [t(source)],
    provenance: `assumed`
  })),
  {
    name: `an unterminated masked link leaves its URL as a bare link`,
    source: `[label](https://example.com`,
    context: `message`,
    expected: [t(`[label](`), url(`https://example.com`)],
    provenance: `assumed`
  },
  {
    name: `an unterminated code block is text`,
    source: `\`\`\`\nopen`,
    context: `message`,
    expected: [t(`\`\`\``), br, t(`open`)],
    provenance: `assumed`
  }
];

export const cases: MarkdownCase[] = [
  ...observed,
  ...documented,
  ...commonMarkDifferences,
  ...spoilerEdgeCases,
  ...constructs
];
