import { describe, expect, it } from "vite-plus/test";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Section } from "@discordkit/client/components/types/Section";
import type { Thumbnail } from "@discordkit/client/components/types/Thumbnail";
import sectionStyles from "../Section.module.css";
import textDisplayStyles from "../TextDisplay.module.css";
import thumbnailStyles from "../Thumbnail.module.css";
import { byClass, dark, expectColor, find, mountComponents } from "./mount.js";

/**
 * A section is how a card puts a picture or a button beside its text. Values from Discord build 679963: 12px between the text and the accessory, 4px between text displays, the accessory at the top, a button accessory never wider than half the section less the 12px, and a thumbnail an 85px square with 8px corners, its picture cropped to fill it.
 */

const thumbnail = (overrides: Partial<Thumbnail> = {}): Thumbnail => ({
  type: ComponentType.Thumbnail,
  media: { url: `https://cdn.example/hero.png` },
  ...overrides
});

const button = (label: string): Button => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  label,
  customId: `more`
});

const section = (
  texts: string[],
  accessory: Section[`accessory`] = thumbnail()
): Section => ({
  type: ComponentType.Section,
  components: texts.map((content) => ({
    type: ComponentType.TextDisplay,
    content
  })),
  accessory
});

/** Mounts sections in a container and returns the first one's parts. */
const mountSection = (
  value: Section,
  scene: Parameters<typeof mountComponents>[1] = {}
): {
  root: HTMLElement;
  sectionElement: HTMLElement;
  texts: HTMLElement[];
  accessory: HTMLElement;
} => {
  const root = mountComponents(
    [{ type: ComponentType.Container, components: [value] }],
    scene
  );
  const sectionElement = find(root, byClass(sectionStyles.section));
  return {
    root,
    sectionElement,
    texts: [
      ...sectionElement.querySelectorAll<HTMLElement>(
        byClass(textDisplayStyles.textDisplay)
      )
    ],
    accessory: find(sectionElement, byClass(sectionStyles.accessory))
  };
};

const box = (element: Element): DOMRect => element.getBoundingClientRect();

describe(`a section`, () => {
  it(`puts the accessory 12px after the text, at the section's right edge`, () => {
    const { sectionElement, texts, accessory } = mountSection(
      section([`Ember Knight`])
    );
    const column = texts[0].parentElement;
    if (!column) throw new Error(`No text column.`);
    expect(box(accessory).left - box(column).right).toBe(12);
    expect(box(accessory).right).toBe(box(sectionElement).right);
  });

  it(`stacks its text displays 4px apart`, () => {
    const { texts } = mountSection(section([`One`, `Two`, `Three`]));
    expect(texts).toHaveLength(3);
    expect(box(texts[1]).top - box(texts[0]).bottom).toBe(4);
    expect(box(texts[2]).top - box(texts[1]).bottom).toBe(4);
  });

  it(`keeps the accessory at the top, not centred against a shorter text`, () => {
    const { texts, accessory } = mountSection(section([`One line`]));
    expect(box(accessory).top).toBe(box(texts[0]).top);
    expect(box(accessory).height).toBeGreaterThan(box(texts[0]).height);
  });

  it(`caps a button accessory at half the section's width less the 12px gap, cutting a long label`, () => {
    const { sectionElement, accessory } = mountSection(
      section(
        [`Text`],
        button(`Register for the Saturday mock test session at the library`)
      )
    );
    expect(box(accessory).width).toBeCloseTo(
      box(sectionElement).width / 2 - 12,
      1
    );
    const label = accessory.querySelector(`button`);
    if (!label) throw new Error(`No button.`);
    expect(box(label).right).toBeLessThanOrEqual(box(accessory).right);
  });

  it(`lets a short button keep its own width`, () => {
    const { accessory } = mountSection(section([`Text`], button(`Join`)));
    const drawn = accessory.querySelector(`button`);
    if (!drawn) throw new Error(`No button.`);
    expect(box(drawn).width).toBeLessThan(100);
    expect(box(drawn).height).toBe(32);
  });

  it(`wraps long text in a phone-width column without pushing the accessory out of it`, () => {
    const { root, texts, accessory } = mountSection(
      section([`A long sentence `.repeat(20)]),
      { width: 360 }
    );
    expect(box(texts[0]).height).toBeGreaterThan(100);
    expect(box(accessory).right).toBeLessThanOrEqual(box(root).right);
    expect(box(accessory).width).toBe(85);
  });
});

describe(`a thumbnail`, () => {
  const mountThumbnail = (
    overrides: Partial<Thumbnail> = {},
    scene: Parameters<typeof mountComponents>[1] = {}
  ): { holder: HTMLElement; image: HTMLImageElement } => {
    const { accessory } = mountSection(
      section([`Text`], thumbnail(overrides)),
      scene
    );
    const image = accessory.querySelector(`img`);
    if (!image) throw new Error(`No picture.`);
    return {
      holder: find(accessory, byClass(thumbnailStyles.thumbnail)),
      image
    };
  };

  it(`is Discord's 85px square with 8px corners, the picture cropped to fill it`, () => {
    const { holder, image } = mountThumbnail();
    expect([box(holder).width, box(holder).height]).toStrictEqual([85, 85]);
    expect(getComputedStyle(holder).borderTopLeftRadius).toBe(`8px`);
    expect([box(image).width, box(image).height]).toStrictEqual([85, 85]);
    expect(getComputedStyle(image).objectFit).toBe(`cover`);
  });

  it(`gives the picture its description as alt text`, () => {
    const { image } = mountThumbnail({
      description: `Ember Knight's portrait`
    });
    expect(image.alt).toBe(`Ember Knight's portrait`);
  });

  it(`draws a picture that has not arrived as the image loader's empty box, at full size`, () => {
    const { image } = mountThumbnail();
    expectColor(
      getComputedStyle(image).backgroundColor,
      dark.backgroundBaseLow
    );
    expect(box(image).width).toBe(85);
  });

  it(`blurs a spoilered thumbnail by 44px under a "Spoiler" pill, inside the same 85px box`, () => {
    const { image } = mountThumbnail({ spoiler: true });
    const cover = image.closest(`label`);
    if (!cover) throw new Error(`No spoiler cover.`);
    expect([box(cover).width, box(cover).height]).toStrictEqual([85, 85]);
    const blurred = image.closest(`div`)?.parentElement;
    if (!blurred) throw new Error(`No blurred layer.`);
    expect(getComputedStyle(blurred).filter).toBe(`blur(44px)`);
    expect(cover.textContent).toBe(`Spoiler`);
  });

  it(`draws a spoilered thumbnail revealed when the scene reveals spoilers`, () => {
    const { image } = mountThumbnail(
      { spoiler: true },
      { revealSpoilers: true }
    );
    const blurred = image.closest(`div`)?.parentElement;
    if (!blurred) throw new Error(`No blurred layer.`);
    expect(getComputedStyle(blurred).filter).toBe(`none`);
  });
});
