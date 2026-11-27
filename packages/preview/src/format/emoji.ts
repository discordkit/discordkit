import type { CustomEmojiNode, MarkdownNode } from "../markdown/ast.js";
import type { SceneContext } from "../scene.js";

/**
 * Where emoji images come from.
 *
 * Unicode emoji are drawn as Twemoji, as the Discord client draws them. The images are jdecked/twemoji's SVGs (graphics CC-BY 4.0, see THIRD_PARTY_NOTICES.md), loaded from jsDelivr at a pinned release so a render never changes under a scene because the set was updated.
 */

export const twemojiVersion = `17.0.3`;

/** Where every Twemoji image is, at the pinned release: `<base>/<code points>.svg`. Studio's file bridge serves the same files from the renderer's asset cache. */
export const twemojiBase = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@${twemojiVersion}/assets/svg`;

// As numbers, since both are invisible when written as characters.
const zeroWidthJoiner = 0x200d;
const variationSelector16 = 0xfe0f;

/**
 * Twemoji's file name for an emoji: its code points in lowercase hex, joined by `-`. Variation selector 16 (U+FE0F) is dropped unless the sequence has a zero-width joiner, which is the rule Twemoji names its files by.
 */
export const twemojiCodePoints = (emoji: string): string => {
  const codePoints: number[] = [];
  for (let i = 0; i < emoji.length; i++) {
    const codePoint = emoji.codePointAt(i) ?? 0;
    if (codePoint > 0xffff) i++;
    codePoints.push(codePoint);
  }
  const keep = codePoints.includes(zeroWidthJoiner)
    ? codePoints
    : codePoints.filter((codePoint) => codePoint !== variationSelector16);
  return keep.map((codePoint) => codePoint.toString(16)).join(`-`);
};

export const twemojiUrl = (emoji: string): string =>
  `${twemojiBase}/${twemojiCodePoints(emoji)}.svg`;

/**
 * The image for a custom emoji: the scene's entry for its id, or Discord's CDN. The CDN URL asks for a still WebP even for an animated emoji, so a screenshot does not depend on which frame of a GIF was showing.
 */
export const customEmojiUrl = (
  node: CustomEmojiNode,
  context: SceneContext | undefined
): string =>
  context?.emoji?.[node.id]?.url ??
  `https://cdn.discordapp.com/emojis/${node.id}.webp?size=96&quality=lossless`;

/** The most emoji a text can hold and still be drawn at jumbo size. The client decides this in JavaScript; unverified. */
export const maxJumboEmoji = 30;

/** Whether a text is only emoji and whitespace, which Discord draws with its emoji at jumbo size. */
export const isJumbo = (nodes: readonly MarkdownNode[]): boolean => {
  let count = 0;
  for (const node of nodes) {
    if (node.type === `emoji` || node.type === `customEmoji`) {
      count++;
    } else if (
      !(
        node.type === `lineBreak` ||
        (node.type === `text` && node.content.trim() === ``)
      )
    ) {
      return false;
    }
  }
  return count > 0 && count <= maxJumboEmoji;
};
