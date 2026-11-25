import { useMemo, type ReactElement } from "react";
import type { CustomEmojiNode } from "../markdown/ast.js";
import { CustomEmoji, UnicodeEmoji } from "./Emoji.js";

/** The emoji a button or a select option carries: Discord's partial emoji, `id`, `name` and `animated`. */
export interface PartialEmojiData {
  id?: string | null;
  name?: string | null;
  animated?: boolean;
}

/** A partial emoji: a server emoji by its id, or a Unicode emoji by its character. Draws nothing for one with neither. */
export const PartialEmoji = ({
  emoji
}: {
  emoji: PartialEmojiData;
}): ReactElement | null => {
  const { id, name, animated } = emoji;
  const node = useMemo(
    (): CustomEmojiNode | undefined =>
      id
        ? {
            type: `customEmoji`,
            id,
            name: name ?? `_`,
            animated: animated ?? false
          }
        : undefined,
    [id, name, animated]
  );
  if (node) return <CustomEmoji node={node} jumbo={false} />;
  return name ? <UnicodeEmoji value={name} jumbo={false} /> : null;
};
