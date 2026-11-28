import type { ReactElement } from "react";
import type { CustomEmojiNode } from "../markdown/ast.js";
import { customEmojiUrl, twemojiUrl } from "../format/emoji.js";
import { Image } from "./Image.js";
import { useSceneSettings } from "./SceneContext.js";
import styles from "./Emoji.module.css";

export interface UnicodeEmojiProps {
  value: string;
  /** Drawn at jumbo size: the text is only emoji. */
  jumbo: boolean;
}

/** A Unicode emoji, drawn as its Twemoji image as Discord draws it, rather than in the machine's emoji font. */
export const UnicodeEmoji = ({
  value,
  jumbo
}: UnicodeEmojiProps): ReactElement => (
  <Image
    reference={twemojiUrl(value)}
    alt={value}
    className={jumbo ? `${styles.emoji} ${styles.jumbo}` : styles.emoji}
  />
);

export interface CustomEmojiProps {
  node: CustomEmojiNode;
  jumbo: boolean;
}

/** A server's custom emoji, drawn from the scene's emoji entry or Discord's CDN. Its alt text is `:name:`, as in the client. */
export const CustomEmoji = ({
  node,
  jumbo
}: CustomEmojiProps): ReactElement => {
  const { context } = useSceneSettings();
  return (
    <Image
      reference={customEmojiUrl(node, context)}
      alt={`:${node.name}:`}
      className={jumbo ? `${styles.emoji} ${styles.jumbo}` : styles.emoji}
    />
  );
};
