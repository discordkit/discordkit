import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import containerStyles from "../Container.module.css";
import coverStyles from "../SpoilerCover.module.css";
import {
  byClass,
  dark,
  expectColor,
  find,
  findCheckbox,
  mountComponents
} from "./mount.js";

/**
 * A spoilered container hides a whole card, an answer or a plot twist, until the reader chooses to see it, so a preview that drew it plainly would show the author something no reader sees. Values from Discord build 679963: the container blurred by 44px (`.container_*.isHidden_*`, the embed spoiler radius) over the hidden spoiler colour, with the same "Spoiler" pill as a hidden attachment.
 */

const mountSpoiler = (
  scene: Parameters<typeof mountComponents>[1] = {}
): { cover: HTMLElement; card: HTMLElement } => {
  const root = mountComponents(
    [
      {
        type: ComponentType.Container,
        spoiler: true,
        accentColor: 0x5865f2,
        components: [
          { type: ComponentType.TextDisplay, content: `Grove Warden` }
        ]
      }
    ],
    scene
  );
  return {
    cover: find(root, byClass(coverStyles.spoiler)),
    card: find(root, byClass(containerStyles.container))
  };
};

describe(`a spoilered container`, () => {
  it(`is blurred by 44px over the hidden spoiler colour, clipped to 8px corners`, () => {
    const { cover, card } = mountSpoiler();
    const blurred = card.parentElement;
    if (!blurred) throw new Error(`No blurred layer.`);
    expect(getComputedStyle(blurred).filter).toBe(`blur(44px)`);
    const style = getComputedStyle(cover);
    expectColor(style.backgroundColor, dark.spoilerHidden);
    expect(style.overflow).toBe(`hidden`);
    expect(style.borderTopLeftRadius).toBe(`8px`);
  });

  it(`keeps the card's own size, so the message is as tall hidden as revealed`, () => {
    const { cover, card } = mountSpoiler();
    expect(cover.getBoundingClientRect().height).toBe(
      card.getBoundingClientRect().height
    );
  });

  it(`shows Discord's "Spoiler" pill in its middle`, () => {
    const { cover } = mountSpoiler();
    const pill = find(cover, byClass(coverStyles.warning));
    expect(pill.textContent).toBe(`Spoiler`);
    const style = getComputedStyle(pill);
    expect(style.textTransform).toBe(`uppercase`);
    expect(style.fontSize).toBe(`15px`);
    expectColor(style.backgroundColor, dark.spoilerWarning);
    const middle = (rect: DOMRect): number => rect.top + rect.height / 2;
    expect(middle(pill.getBoundingClientRect())).toBeCloseTo(
      middle(cover.getBoundingClientRect()),
      0
    );
  });

  it(`reveals the card when clicked, with no script`, () => {
    const { cover, card } = mountSpoiler();
    findCheckbox(cover).click();
    expect(getComputedStyle(card.parentElement ?? card).filter).toBe(`none`);
    expect(
      getComputedStyle(find(cover, byClass(coverStyles.warning))).display
    ).toBe(`none`);
  });

  it(`draws the card revealed when the scene reveals spoilers`, () => {
    const { card } = mountSpoiler({ revealSpoilers: true });
    expect(getComputedStyle(card.parentElement ?? card).filter).toBe(`none`);
  });
});
