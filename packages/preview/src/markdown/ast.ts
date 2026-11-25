/**
 * The typed tree `parseMarkdown` returns. Every node carries what the source said and nothing the renderer has to look up: a mention holds an id, a timestamp holds seconds and a style letter, an emoji holds its characters. Turning those into names, dates and images is the renderer's job, so the same tree serves lint and length checks that have no scene to resolve against.
 *
 * `MarkdownNode` is one discriminated union so a renderer can `switch` over `type` and have the compiler check that it handled every case.
 */

/** Plain text, exactly as written apart from escapes, which are already removed. Never contains a newline: those are `lineBreak` nodes. */
export interface TextNode {
  type: `text`;
  content: string;
}

/** One newline in the source. Discord keeps every newline, blank lines included, so `a\n\n\nb` holds three of these. */
export interface LineBreakNode {
  type: `lineBreak`;
}

/** `#`, `##` or `###` and a space at the start of a line. Styles that one line only. */
export interface HeadingNode {
  type: `heading`;
  level: 1 | 2 | 3;
  content: MarkdownNode[];
}

/** `-# ` at the start of a line: one line of small, muted text. */
export interface SubtextNode {
  type: `subtext`;
  content: MarkdownNode[];
}

/** Consecutive `> ` lines, or `>>> ` and everything after it. */
export interface BlockQuoteNode {
  type: `blockQuote`;
  content: MarkdownNode[];
}

/** A bulleted (`- `, `* `) or numbered (`1. `) list. Each item is its own array of nodes, and may hold a nested list. */
export interface ListNode {
  type: `list`;
  ordered: boolean;
  /** The number the first item was written with, for a numbered list. */
  start?: number;
  items: MarkdownNode[][];
}

/** A fenced block between triple backticks. The content is raw: nothing inside is parsed. */
export interface CodeBlockNode {
  type: `codeBlock`;
  /** The word right after the opening backticks, when a newline follows it. */
  lang?: string;
  content: string;
}

/** `` `code` ``. The content is raw. */
export interface InlineCodeNode {
  type: `inlineCode`;
  content: string;
}

/** `**bold**`. */
export interface BoldNode {
  type: `bold`;
  content: MarkdownNode[];
}

/** `*italic*` or `_italic_`. */
export interface ItalicNode {
  type: `italic`;
  content: MarkdownNode[];
}

/** `__underline__`. */
export interface UnderlineNode {
  type: `underline`;
  content: MarkdownNode[];
}

/** `~~strikethrough~~`. */
export interface StrikethroughNode {
  type: `strikethrough`;
  content: MarkdownNode[];
}

/** `||spoiler||`. */
export interface SpoilerNode {
  type: `spoiler`;
  content: MarkdownNode[];
}

/** A bare URL, a `<url>` autolink, or a `[label](url)` masked link. */
export interface LinkNode {
  type: `link`;
  target: string;
  /** For a bare URL or an autolink this is the URL as text; for a masked link it is the parsed label. */
  content: MarkdownNode[];
  /** Hover text from `[label](url "title")`. */
  title?: string;
  /** `[label](url)`: the label is shown instead of the URL. */
  masked: boolean;
  /** `<url>` and `[label](<url>)`: Discord shows no link preview for this URL. */
  suppressEmbed: boolean;
}

/** `<@id>`, or the deprecated `<@!id>`, which Discord treats the same. */
export interface UserMentionNode {
  type: `userMention`;
  id: string;
}

/** `<@&id>`. */
export interface RoleMentionNode {
  type: `roleMention`;
  id: string;
}

/** `<#id>`. */
export interface ChannelMentionNode {
  type: `channelMention`;
  id: string;
}

/** `@everyone` or `@here`. */
export interface GlobalMentionNode {
  type: `globalMention`;
  target: `everyone` | `here`;
}

/** `</name:id>`, `</name sub:id>` or `</name group sub:id>`. */
export interface CommandMentionNode {
  type: `commandMention`;
  /** The command's name parts joined by single spaces, as the client shows them after the slash. */
  name: string;
  id: string;
}

export type GuildNavigationTarget =
  | `customize`
  | `browse`
  | `guide`
  | `linked-roles`;

/** `<id:customize>`, `<id:browse>`, `<id:guide>`, `<id:linked-roles>` or `<id:linked-roles:roleId>`. */
export interface GuildNavigationNode {
  type: `guildNavigation`;
  target: GuildNavigationTarget;
  /** Only for `linked-roles`: the role whose connection prompt the link opens. */
  roleId?: string;
}

/** Discord's nine timestamp styles. `f` is the default when none is written. */
export type TimestampStyle =
  | `t`
  | `T`
  | `d`
  | `D`
  | `f`
  | `F`
  | `s`
  | `S`
  | `R`;

/** `<t:seconds>` or `<t:seconds:style>`. */
export interface TimestampNode {
  type: `timestamp`;
  /** Unix time in seconds, as written. */
  timestamp: number;
  style: TimestampStyle;
}

/** `<:name:id>` or `<a:name:id>`. */
export interface CustomEmojiNode {
  type: `customEmoji`;
  name: string;
  id: string;
  animated: boolean;
}

/** One Unicode emoji, including any skin-tone modifier, joiner sequence, flag or keycap, so a renderer can draw it as one image. */
export interface EmojiNode {
  type: `emoji`;
  value: string;
}

export type MarkdownNode =
  | TextNode
  | LineBreakNode
  | HeadingNode
  | SubtextNode
  | BlockQuoteNode
  | ListNode
  | CodeBlockNode
  | InlineCodeNode
  | BoldNode
  | ItalicNode
  | UnderlineNode
  | StrikethroughNode
  | SpoilerNode
  | LinkNode
  | UserMentionNode
  | RoleMentionNode
  | ChannelMentionNode
  | GlobalMentionNode
  | CommandMentionNode
  | GuildNavigationNode
  | TimestampNode
  | CustomEmojiNode
  | EmojiNode;

export type MarkdownNodeType = MarkdownNode[`type`];
