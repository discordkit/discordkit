import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MediaGalleryItem } from "@discordkit/client/components/types/MediaGalleryItem";
import containerStyles from "../Container.module.css";
import { byClass, dark, expectColor, find, mountComponents } from "./mount.js";

/**
 * Gallery size and crop by item count were what Tome's author iterated on most, and they decide whether a card fits. The sizes here are the ones measured in screenshots of the real desktop client (spec §7b): a lone picture at its file's own size, never scaled up, and scaled down to the width and to 350px tall; a pair of small pictures at their own size 4px apart; four as an even 2×2 filling the width, which turns square pictures into wide tiles. A container holding one or two pictures shrinks to them. Three items making one large panel beside two stacked was seen only on iOS. The rest is Discord build 679963's stylesheet: a 4px gap, 2px item corners, an 8px outer radius, 350px and 280px caps, a 44px spoiler blur.
 *
 * Every picture here gives its size in the payload, as Discord's API returns it, so the layout does not depend on a picture loading. The column is 600px wide, leaving at most 470px for a gallery inside a container (504px less 16px padding and a 1px border each side).
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

/** Mounts a gallery of `items` in a container and returns its pictures' boxes and the container's. */
const mountGallery = (
  items: MediaGalleryItem[],
  width?: number
): {
  root: HTMLElement;
  boxes: DOMRect[];
  images: HTMLImageElement[];
  card: DOMRect;
} => {
  const root = mountComponents(
    [
      {
        type: ComponentType.Container,
        components: [{ type: ComponentType.MediaGallery, items }]
      }
    ],
    { width }
  );
  // The author has no picture, so their avatar is drawn without an image, and every image is a gallery picture.
  const images = [...root.querySelectorAll(`img`)];
  const card = find(root, byClass(containerStyles.container));
  return {
    root,
    images,
    boxes: images.map((image) => image.getBoundingClientRect()),
    card: card.getBoundingClientRect()
  };
};

/** A container's padding and border on both sides: what it adds to the width of what it holds. */
const cardInsets = 2 * (16 + 1);

const square = (): MediaGalleryItem => item(128, 128);
const wide = (): MediaGalleryItem => item(256, 144);

describe(`a media gallery`, () => {
  it.each([
    [88, 64],
    [128, 128],
    [256, 144],
    [32, 32]
  ])(
    `draws a lone %ix%i picture at its file's own size, never scaled up, as the desktop client draws one`,
    (width, height) => {
      const { boxes } = mountGallery([item(width, height)]);
      expect(boxes[0].width).toBe(width);
      expect(boxes[0].height).toBe(height);
    }
  );

  it(`shrinks the container to a lone picture, so a card with a small picture is only as wide as it needs to be`, () => {
    const { card } = mountGallery([item(88, 64)]);
    expect(card.width).toBe(88 + cardInsets);
  });

  it(`scales a picture wider than the container down to the container's width, keeping its shape`, () => {
    const { boxes } = mountGallery([item(1200, 675)]);
    expect(boxes[0].width).toBe(470);
    expect(boxes[0].height).toBeCloseTo(470 / (1200 / 675), 0);
  });

  it(`scales a tall picture down to 350px tall, keeping its shape, as the client draws a tall page 350px tall`, () => {
    const { boxes } = mountGallery([item(600, 940)]);
    expect(boxes[0].height).toBeCloseTo(350, 1);
    expect(boxes[0].width).toBeCloseTo(350 * (600 / 940), 0);
  });

  it(`draws a lone picture whose size is unknown and that has not arrived as a 350px square box, and does not take the placeholder's one-pixel image for its size`, async () => {
    const root = mountComponents([
      {
        type: ComponentType.MediaGallery,
        items: [{ media: { url: `https://cdn.example/unknown.png` } }]
      }
    ]);
    const image = root.querySelector(`img`);
    if (!image) throw new Error(`No picture was drawn.`);
    await image.decode();
    // Let the load event reach React's handler before measuring.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const box = image.getBoundingClientRect();
    expect(box.width).toBe(350);
    expect(box.height).toBe(350);
  });

  it(`rounds a lone picture's corners by 8px`, () => {
    const { images } = mountGallery([wide()]);
    const holder = images[0].parentElement;
    if (!holder) throw new Error(`The picture has no holder.`);
    expect(getComputedStyle(holder).borderTopLeftRadius).toBe(`8px`);
  });

  it(`draws a pair of small pictures at their own size, 4px apart, and shrinks the container to them, as the client draws two 256×144 pictures in a 550px card`, () => {
    // An 800px column, so the container could be its full 600px, as in the capture.
    const { boxes, card } = mountGallery([wide(), wide()], 800);
    expect(boxes[1].left - boxes[0].right).toBe(4);
    expect(boxes[0].top).toBe(boxes[1].top);
    for (const box of boxes) {
      expect(box.width).toBe(256);
      expect(box.height).toBe(144);
    }
    expect(card.width).toBe(550);
  });

  it(`splits the width evenly between a pair of large pictures of one size (a choice: no large pair has been captured)`, () => {
    const { boxes } = mountGallery([item(1200, 675), item(1200, 675)]);
    expect(boxes[1].left - boxes[0].right).toBe(4);
    for (const box of boxes) {
      expect(box.width).toBe((470 - 4) / 2);
      expect(box.height).toBeCloseTo((470 - 4) / 2 / (1200 / 675), 0);
    }
  });

  it(`keeps each of a pair of different shapes at its own shape, top-aligned, rather than cropping one to the other (a choice: no mixed pair has been captured)`, () => {
    const { boxes } = mountGallery([square(), wide()]);
    expect(boxes[0].width).toBe(128);
    expect(boxes[0].height).toBe(128);
    expect(boxes[1].width).toBe(256);
    expect(boxes[1].height).toBe(144);
    expect(boxes[1].top).toBe(boxes[0].top);
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

  it(`draws four as an even 2×2 filling the width within 350px, which turns square pictures into wide tiles, as the client draws four 32px icons`, () => {
    const { boxes, card } = mountGallery([
      item(32, 32),
      item(32, 32),
      item(32, 32),
      item(32, 32)
    ]);
    const [first, second, third] = boxes;
    expect(second.top).toBe(first.top);
    expect(third.left).toBe(first.left);
    expect(third.top - first.bottom).toBe(4);
    expect(third.bottom - first.top).toBe(350);
    expect(first.width).toBe((470 - 4) / 2);
    expect(card.width).toBe(470 + cardInsets);
  });

  it(`fills a 600px container with four, as the desktop client does in a wide window`, () => {
    const { card } = mountGallery(Array.from({ length: 4 }, wide), 800);
    expect(card.width).toBe(600);
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
