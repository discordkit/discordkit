import { describe, expect, it } from "vite-plus/test";
import { parseMarkdown } from "../../markdown/parse.js";
import {
  customEmojiUrl,
  isJumbo,
  maxJumboEmoji,
  twemojiCodePoints,
  twemojiUrl
} from "../emoji.js";

/** Written as code points, since several of these characters are invisible in source. */
const chars = (...codePoints: number[]): string =>
  String.fromCodePoint(...codePoints);

describe(`twemoji file names`, () => {
  // A wrong file name is a 404, which draws a placeholder where the emoji should be.
  it.each([
    [`a plain emoji`, chars(0x1f600), `1f600`],
    [
      `an emoji with variation selector 16, which Twemoji's file names drop`,
      chars(0x2764, 0xfe0f),
      `2764`
    ],
    [`a skin-tone sequence`, chars(0x1f44d, 0x1f3fd), `1f44d-1f3fd`],
    [`a flag`, chars(0x1f1ef, 0x1f1f5), `1f1ef-1f1f5`],
    [
      `a keycap, whose variation selector is dropped like any other outside a joined sequence`,
      chars(0x31, 0xfe0f, 0x20e3),
      `31-20e3`
    ],
    [
      `a zero-width-joiner sequence, which keeps its variation selectors`,
      chars(0x1f3f3, 0xfe0f, 0x200d, 0x1f308),
      `1f3f3-fe0f-200d-1f308`
    ]
  ])(`names %s by its code points`, (_, emoji, expected) => {
    expect(twemojiCodePoints(emoji)).toBe(expected);
  });

  it(`loads from a pinned jdecked/twemoji release, so the set cannot change under a scene`, () => {
    expect(twemojiUrl(chars(0x2705))).toBe(
      `https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/2705.svg`
    );
  });
});

describe(`custom emoji images`, () => {
  const node = {
    type: `customEmoji`,
    name: `blobcat`,
    id: `396521773140586496`,
    animated: true
  } as const;

  it(`uses the scene's image for the emoji when it has one`, () => {
    expect(
      customEmojiUrl(node, {
        emoji: { [node.id]: { name: `blobcat`, url: `attachment://blob.png` } }
      })
    ).toBe(`attachment://blob.png`);
  });

  it(`otherwise asks Discord's CDN for a still image, even for an animated emoji, so the screenshot does not depend on a GIF's frame`, () => {
    expect(customEmojiUrl(node, undefined)).toBe(
      `https://cdn.discordapp.com/emojis/396521773140586496.webp?size=96&quality=lossless`
    );
  });
});

describe(`jumbo emoji`, () => {
  const smile = chars(0x1f600);

  it(`draws a text of only emoji and spaces at jumbo size, custom emoji included`, () => {
    expect(isJumbo(parseMarkdown(`${smile} ${smile}\n<:blob:1>`))).toBe(true);
  });

  it(`keeps emoji inline once there is any other text`, () => {
    expect(isJumbo(parseMarkdown(`${smile} nice`))).toBe(false);
    expect(isJumbo(parseMarkdown(`**${smile}**`))).toBe(false);
  });

  it(`is not jumbo for an empty or blank text, which has no emoji to enlarge`, () => {
    expect(isJumbo(parseMarkdown(``))).toBe(false);
    expect(isJumbo(parseMarkdown(`  \n `))).toBe(false);
  });

  it(`stops at ${String(maxJumboEmoji)} emoji, past which Discord draws them at text size`, () => {
    expect(isJumbo(parseMarkdown(smile.repeat(maxJumboEmoji)))).toBe(true);
    expect(isJumbo(parseMarkdown(smile.repeat(maxJumboEmoji + 1)))).toBe(false);
  });
});
