import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MediaGalleryItem } from "@discordkit/client/components/types/MediaGalleryItem";
import { dark, expectColor, mountComponents } from "./mount.js";

/**
 * Gallery size and crop by item count were what Tome's author iterated on most, and what they established in the client is the strongest evidence here: three items make one large panel beside two stacked, four make an even 2×2 whose square pictures come out as wide tiles, two keep their shape, and pictures are scaled to fill their slot rather than drawn at their file's size. The rest is Discord build 679963's stylesheet: a 4px gap, 2px item corners, an 8px outer radius, 350px and 280px caps, a 44px spoiler blur.
 *
 * Every picture here gives its size in the payload, as Discord's API returns it, so the layout does not depend on a picture loading. The column is 600px wide, leaving a 470px gallery inside a container (504px less 16px padding and a 1px border each side).
 */

const item = (
  width: number,
  height: number,
  extra: Partial<MediaGalleryItem> = {}
): MediaGalleryItem => ({
  media: {
    url: `https://cdn.example/${String(width)}x${String(height)}.png`,
    width,
    height
  },
  ...extra
});

/** Mounts a gallery of `items` in a container and returns its pictures' boxes. */
const mountGallery = (
  items: MediaGalleryItem[]
): { root: HTMLElement; boxes: DOMRect[]; images: HTMLImageElement[] } => {
  const root = mountComponents([
    {
      type: ComponentType.Container,
      components: [{ type: ComponentType.MediaGallery, items }]
    }
  ]);
  // The author has no picture, so their avatar is drawn without an image, and every image is a gallery picture.
  const images = [...root.querySelectorAll(`img`)];
  return {
    root,
    images,
    boxes: images.map((image) => image.getBoundingClientRect())
  };
};

const square = (): MediaGalleryItem => item(128, 128);
const wide = (): MediaGalleryItem => item(256, 144);

describe(`a media gallery`, () => {
  it(`scales a lone picture up to fill its slot, keeping its shape, as Tome saw a 32px icon drawn large`, () => {
    const { boxes } = mountGallery([item(32, 32)]);
    expect(boxes[0].width).toBe(350);
    expect(boxes[0].height).toBe(350);
  });

  it(`draws a lone wide picture as wide as the gallery, at its own ratio`, () => {
    const { boxes } = mountGallery([wide()]);
    expect(boxes[0].width).toBe(470);
    expect(boxes[0].height).toBeCloseTo(470 / (256 / 144), 0);
  });

  it(`rounds a lone picture's corners by 8px`, () => {
    const { images } = mountGallery([wide()]);
    const holder = images[0].parentElement;
    if (!holder) throw new Error(`The picture has no holder.`);
    expect(getComputedStyle(holder).borderTopLeftRadius).toBe(`8px`);
  });

  it(`puts two pictures side by side, 4px apart, and keeps square pictures square`, () => {
    const { boxes } = mountGallery([square(), square()]);
    expect(boxes[1].left - boxes[0].right).toBe(4);
    expect(boxes[0].top).toBe(boxes[1].top);
    expect(boxes[0].width).toBe(233);
    expect(boxes[0].height).toBe(233);
  });

  it(`draws three as one large picture beside two stacked, the large one taking two thirds`, () => {
    const { boxes } = mountGallery([wide(), wide(), wide()]);
    const [solo, upper, lower] = boxes;
    expect(solo.width / (solo.width + upper.width)).toBeCloseTo(2 / 3, 2);
    expect(upper.left).toBe(lower.left);
    expect(lower.top - upper.bottom).toBe(4);
    expect(upper.top).toBe(solo.top);
    expect(lower.bottom).toBe(solo.bottom);
  });

  it(`draws four as an even 2×2 within 350px, which turns square pictures into wide tiles`, () => {
    const { boxes } = mountGallery([square(), square(), square(), square()]);
    const [first, second, third] = boxes;
    expect(second.top).toBe(first.top);
    expect(third.left).toBe(first.left);
    expect(third.top - first.bottom).toBe(4);
    expect(third.bottom - first.top).toBe(350);
    expect(first.width).toBeGreaterThan(first.height);
  });

  it(`draws six and nine as square tiles, three to a row`, () => {
    const { boxes } = mountGallery(Array.from({ length: 6 }, wide));
    expect(new Set(boxes.map((box) => box.top)).size).toBe(2);
    for (const box of boxes) {
      expect(box.width).toBeCloseTo(box.height, 0);
      expect(box.width).toBeCloseTo((470 - 8) / 3, 0);
    }
  });

  it(`spaces a band of one or two pictures 4px above the 3-column grid that follows it`, () => {
    const { boxes } = mountGallery(Array.from({ length: 7 }, wide));
    expect(boxes[0].width).toBe(470);
    expect(boxes[1].top - boxes[0].bottom).toBe(4);
  });

  it(`clips the whole gallery to an 8px radius and its pictures to 2px`, () => {
    const { images } = mountGallery([square(), square()]);
    const holder = images[0].parentElement;
    const gallery = holder?.parentElement?.parentElement;
    if (!holder || !gallery) throw new Error(`The gallery did not render.`);
    expect(getComputedStyle(holder).borderTopLeftRadius).toBe(`2px`);
    expect(getComputedStyle(gallery).borderTopLeftRadius).toBe(`8px`);
    expect(getComputedStyle(gallery).overflow).toBe(`hidden`);
  });

  it(`gives each picture its description as alt text`, () => {
    const { images } = mountGallery([
      item(128, 128, { description: `A: Ember Knight` })
    ]);
    expect(images[0].alt).toBe(`A: Ember Knight`);
  });

  it(`draws a picture that has not arrived as Discord's empty loading box`, () => {
    const { images } = mountGallery([square()]);
    expectColor(
      getComputedStyle(images[0]).backgroundColor,
      dark.backgroundBaseLow
    );
  });

  it(`blurs a spoilered picture by 44px under a "Spoiler" pill until it is clicked`, () => {
    const { images } = mountGallery([item(128, 128, { spoiler: true })]);
    const holder = images[0].parentElement;
    const pill = holder?.querySelector(`span`);
    const toggle = holder?.querySelector(`input`);
    if (!holder || !pill || !toggle) throw new Error(`No spoiler was drawn.`);
    expect(getComputedStyle(images[0]).filter).toBe(`blur(44px)`);
    expect(pill.textContent).toBe(`Spoiler`);
    const pillStyle = getComputedStyle(pill);
    expect(pillStyle.textTransform).toBe(`uppercase`);
    expect(pillStyle.fontSize).toBe(`15px`);
    expect(pillStyle.fontWeight).toBe(`600`);
    expect(pillStyle.borderTopLeftRadius).toBe(`20px`);
    expectColor(pillStyle.backgroundColor, dark.spoilerWarning);
    expectColor(pillStyle.color, dark.spoilerWarningText);
    expectColor(getComputedStyle(holder).backgroundColor, dark.spoilerHidden);
    toggle.click();
    expect(getComputedStyle(images[0]).filter).toBe(`none`);
    expect(getComputedStyle(pill).display).toBe(`none`);
  });

  it(`draws spoilers revealed when the scene asks for it`, () => {
    const root = mountComponents(
      [
        {
          type: ComponentType.MediaGallery,
          items: [item(128, 128, { spoiler: true })]
        }
      ],
      { revealSpoilers: true }
    );
    const image = root.querySelector(`label img`);
    if (!image) throw new Error(`No spoiler was drawn.`);
    expect(getComputedStyle(image).filter).toBe(`none`);
  });
});
