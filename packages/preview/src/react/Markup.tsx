import { Fragment, useMemo, type ReactElement, type ReactNode } from "react";
import type { ListNode, MarkdownNode } from "../markdown/ast.js";
import { isJumbo } from "../format/emoji.js";
import { BlockQuote } from "./BlockQuote.js";
import { CustomEmoji, UnicodeEmoji } from "./Emoji.js";
import {
  ChannelMention,
  CommandMention,
  GlobalMention,
  GuildNavigation,
  RoleMention,
  UserMention
} from "./Mention.js";
import { Spoiler } from "./Spoiler.js";
import { Timestamp } from "./Timestamp.js";
import styles from "./Markup.module.css";

/** Thrown if a node type is added to the markdown AST without a way to draw it. The `never` parameter makes that a compile error first. */
const unhandled = (node: never): never => {
  throw new Error(
    `@discordkit/preview has no way to draw a markdown node of type ${JSON.stringify((node as { type?: unknown }).type)}. Every node type the parser produces needs a case in Markup.tsx, and this one has none, which is a bug in the package. Please report it with the text that produced it.`
  );
};

/** The width of an ordered list's widest number, in characters, which Discord's stylesheet reads to indent the list far enough for it. Discord sets this in JavaScript; unverified. */
const totalCharacters = (list: ListNode): number =>
  String((list.start ?? 1) + list.items.length - 1).length;

const renderItems = (list: ListNode): ReactNode =>
  list.items.map((item, index) => (
    // oxlint-disable-next-line react/no-array-index-key -- source order is the identity; items have no key of their own.
    <li key={index} className={styles.item}>
      {renderNodes(item)}
    </li>
  ));

const BulletedList = ({ list }: { list: ListNode }): ReactElement => (
  <ul className={`${styles.list} ${styles.bulleted}`}>{renderItems(list)}</ul>
);

const NumberedList = ({ list }: { list: ListNode }): ReactElement => {
  const width = totalCharacters(list);
  // React's style type has no entries for custom properties; this is the one the numbered-list rule reads.
  const style = useMemo(
    (): Record<string, number> => ({ "--totalCharacters": width }),
    [width]
  );
  return (
    <ol
      className={`${styles.list} ${styles.numbered}`}
      start={list.start}
      style={style}
    >
      {renderItems(list)}
    </ol>
  );
};

const renderNode = (node: MarkdownNode, jumbo: boolean): ReactNode => {
  switch (node.type) {
    case `text`:
      return node.content;
    case `lineBreak`:
      // Discord keeps each newline as text and lets `white-space: break-spaces` draw it, so blank lines keep their height.
      return `\n`;
    case `heading`: {
      const content = renderNodes(node.content);
      if (node.level === 1) {
        return <h1 className={`${styles.heading} ${styles.h1}`}>{content}</h1>;
      }
      if (node.level === 2) {
        return <h2 className={`${styles.heading} ${styles.h2}`}>{content}</h2>;
      }
      return <h3 className={`${styles.heading} ${styles.h3}`}>{content}</h3>;
    }
    case `subtext`:
      return (
        <small className={styles.subtext}>{renderNodes(node.content)}</small>
      );
    case `blockQuote`:
      return <BlockQuote>{renderNodes(node.content)}</BlockQuote>;
    case `list`:
      return node.ordered ? (
        <NumberedList list={node} />
      ) : (
        <BulletedList list={node} />
      );
    case `codeBlock`:
      return (
        <pre className={styles.pre}>
          <code className={styles.codeBlock}>{node.content}</code>
        </pre>
      );
    case `inlineCode`:
      return <code className={styles.inlineCode}>{node.content}</code>;
    case `bold`:
      return (
        <strong className={styles.bold}>{renderNodes(node.content)}</strong>
      );
    case `italic`:
      return <em className={styles.italic}>{renderNodes(node.content)}</em>;
    case `underline`:
      return <u className={styles.underline}>{renderNodes(node.content)}</u>;
    case `strikethrough`:
      return (
        <s className={styles.strikethrough}>{renderNodes(node.content)}</s>
      );
    case `spoiler`:
      return <Spoiler>{renderNodes(node.content)}</Spoiler>;
    case `link`:
      return (
        <a
          className={styles.link}
          href={node.target}
          title={node.title ?? node.target}
          target="_blank"
          rel="noreferrer noopener"
        >
          {renderNodes(node.content)}
        </a>
      );
    case `userMention`:
      return <UserMention node={node} />;
    case `roleMention`:
      return <RoleMention node={node} />;
    case `channelMention`:
      return <ChannelMention node={node} />;
    case `globalMention`:
      return <GlobalMention node={node} />;
    case `commandMention`:
      return <CommandMention node={node} />;
    case `guildNavigation`:
      return <GuildNavigation node={node} />;
    case `timestamp`:
      return <Timestamp node={node} />;
    case `customEmoji`:
      return <CustomEmoji node={node} jumbo={jumbo} />;
    case `emoji`:
      return <UnicodeEmoji value={node.value} jumbo={jumbo} />;
    default:
      return unhandled(node);
  }
};

function renderNodes(nodes: readonly MarkdownNode[], jumbo = false): ReactNode {
  return nodes.map((node, index) => (
    // oxlint-disable-next-line react/no-array-index-key -- source order is the identity; nodes have no key of their own.
    <Fragment key={index}>{renderNode(node, jumbo)}</Fragment>
  ));
}

export interface MarkupProps {
  nodes: readonly MarkdownNode[];
}

/** Draws parsed Discord markdown the way the client's markup does. A text that is only emoji draws them at jumbo size. */
export const Markup = ({ nodes }: MarkupProps): ReactElement => (
  <>{renderNodes(nodes, isJumbo(nodes))}</>
);
