import { describe, expect, it } from "vite-plus/test";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MediaGalleryItem } from "@discordkit/client/components/types/MediaGalleryItem";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import buttonStyles from "../ButtonBase.module.css";
import containerStyles from "../Container.module.css";
import galleryStyles from "../MediaGallery.module.css";
import markupStyles from "../Markup.module.css";
import messageStyles from "../Message.module.css";
import separatorStyles from "../Separator.module.css";
import thumbnailStyles from "../Thumbnail.module.css";
import timestampStyles from "../Timestamp.module.css";
import textStyles from "../TextDisplay.module.css";
import { byClass, expectColor, find, mountScene } from "./mount.js";

/**
 * The iOS layout, against what captures of the iOS app on an iPhone 14 Pro show (spec §7b), in points, which are CSS pixels here. The phone is 393 points wide. Each value names the capture it was read from in its stylesheet; here each test says what the value is and why it matters to a person reviewing a card for their phone. Desktop's own specs hold desktop unchanged.
 */

const phoneWidth = 393;

/** Mounts one message from an app, holding `components`, drawn as the iOS app draws it on a 393-point phone. */
const mountPhone = (components: MessageComponent): HTMLElement =>
  mountScene({
    layout: `ios`,
    width: phoneWidth,
    messages: [{ payload: { flags: 1 << 15, components } }]
  });

const inCard = (...components: unknown[]): MessageComponent => [
  { type: ComponentType.Container, components } as never
];

const text = (content: string): unknown => ({
  type: ComponentType.TextDisplay,
  content
});

const rect = (root: ParentNode, className: string | undefined): DOMRect =>
  find(root, byClass(className)).getBoundingClientRect();

const picture = (
  width: number,
  height: number,
  description?: string
): MediaGalleryItem => ({
  media: { url: `https://cdn.example/${String(width)}.png`, width, height },
  ...(description === undefined ? {} : { description })
});

describe(`the iOS layout's message chrome`, () => {
  it(`puts the content column 68 points from the screen's left edge and 16 from its right (309 points wide), the avatar 16 in and 40 square, as every capture with a header shows`, () => {
    const root = mountPhone(inCard(text(`Hi`)));
    const scene = root.getBoundingClientRect();
    const card = rect(root, containerStyles.container);
    expect(card.left - scene.left).toBe(68);
    expect(scene.right - card.right).toBe(16);
    expect(card.width).toBe(309);
    const avatar = rect(root, messageStyles.avatar);
    expect(avatar.left - scene.left).toBe(16);
    expect([avatar.width, avatar.height]).toStrictEqual([40, 40]);
  });

  it(`starts the card 27 points under the avatar's top, under a 22-point header line, as tome-019, tome-023 and tome-054 all show (27.3)`, () => {
    const root = mountPhone(inCard(text(`Hi`)));
    const avatar = rect(root, messageStyles.avatar);
    const header = rect(root, messageStyles.header);
    expect(header.height).toBe(22);
    expect(rect(root, containerStyles.container).top - avatar.top).toBe(27);
  });

  it(`writes the name at 17 points semibold and the time at 13, the sizes the app's cap heights give, and keeps them on one line`, () => {
    const root = mountPhone(inCard(text(`Hi`)));
    const name = getComputedStyle(find(root, byClass(messageStyles.username)));
    expect([name.fontSize, name.fontWeight]).toStrictEqual([`17px`, `600`]);
    const time = getComputedStyle(
      find(
        root,
        `${byClass(messageStyles.header)} ${byClass(messageStyles.timestamp)}`
      )
    );
    expect(time.fontSize).toBe(`13px`);
  });
});

describe(`the iOS layout's container and text`, () => {
  it(`fills the content column even when what it holds is narrow, as the app's cards do (tome-023), where desktop's shrinks to it`, () => {
    const root = mountPhone(
      inCard({ type: ComponentType.MediaGallery, items: [picture(88, 64)] })
    );
    expect(rect(root, containerStyles.container).width).toBe(309);
  });

  it(`starts the content 16 points in from the card's outer edge, hairline included (tome-054)`, () => {
    const root = mountPhone(inCard(text(`Hi`)));
    const card = rect(root, containerStyles.container);
    const inner = rect(root, textStyles.textDisplay);
    // The hairline is half a point, which a 1x screen draws a whole pixel wide.
    expect(inner.left - card.left).toBeGreaterThanOrEqual(16);
    expect(inner.left - card.left).toBeLessThanOrEqual(16.5);
  });

  it(`draws text at 15 points on 20-point lines (tome-025: lines 30 px apart at 1.5038 px per point), larger than desktop's 14 on 19.25`, () => {
    const root = mountPhone(inCard(text(`one\ntwo`)));
    const style = getComputedStyle(find(root, byClass(textStyles.textDisplay)));
    expect([style.fontSize, style.lineHeight]).toStrictEqual([`15px`, `20px`]);
    expect(rect(root, textStyles.textDisplay).height).toBe(40);
  });

  it(`draws a second-level heading at 22 points on a 28-point line, with 4 points under it when it ends its text (tome-019, tome-021, tome-026)`, () => {
    const root = mountPhone(
      inCard(text(`## Which planet has rings?`), text(`x`))
    );
    const heading = find(root, byClass(markupStyles.h2));
    const style = getComputedStyle(heading);
    expect([
      style.fontSize,
      style.lineHeight,
      style.marginBottom
    ]).toStrictEqual([`22px`, `28px`, `4px`]);
  });

  // Its height, the line's 20 points, depends on the font's metrics, which only the Node renderer sets; renderScene.spec.ts measures it.
  it(`fills and pads each piece of a timestamp chip on its own when it wraps mid-phrase, as "ends 2 / days ago" does in tome-054`, () => {
    const root = mountScene({
      layout: `ios`,
      // A column too narrow for "in 3 days", so the chip has to break.
      width: 160,
      now: `2026-11-25T11:05:00Z`,
      messages: [
        {
          payload: {
            flags: 1 << 15,
            components: inCard(
              text(`A long line of text · ends <t:1795863900:R>`)
            )
          }
        }
      ]
    });
    const chip = find(root, byClass(timestampStyles.timestamp));
    expect(getComputedStyle(chip).boxDecorationBreak).toBe(`clone`);
    expect(chip.getClientRects().length).toBeGreaterThan(1);
  });

  it(`draws the separator in the app's lighter grey in the Dark theme (tome-019, tome-056: #4d4d52)`, () => {
    const root = mountPhone(
      inCard(text(`a`), { type: ComponentType.Separator, divider: true })
    );
    expectColor(
      getComputedStyle(find(root, byClass(separatorStyles.separator)))
        .borderBottomColor,
      [77, 77, 82]
    );
  });
});

describe(`the iOS layout's buttons`, () => {
  const buttons = (labels: readonly string[]): HTMLElement[] => {
    const root = mountPhone(
      inCard({
        type: ComponentType.ActionRow,
        components: labels.map((label) => ({
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          label,
          customId: label
        }))
      })
    );
    return [
      ...root.querySelectorAll<HTMLElement>(byClass(buttonStyles.button))
    ];
  };

  it(`has no minimum width, so a one-letter answer is about 34 points wide as in tome-029 and tome-056, not desktop's 60`, () => {
    const [button] = buttons([`A`]);
    const box = button.getBoundingClientRect();
    expect(box.height).toBe(32);
    expect(box.width).toBeLessThan(40);
    expect(box.width).toBeGreaterThan(30);
  });

  it(`puts 12 points either side of the label and writes it at 15 points semibold, 8 points from the next button`, () => {
    const [first, second] = buttons([`A`, `B`]);
    const style = getComputedStyle(first);
    // Padding and the hairline border together; the half-point hairline is drawn a whole pixel wide on a 1x screen.
    const inset =
      Number.parseFloat(style.paddingLeft) +
      Number.parseFloat(style.borderLeftWidth);
    expect(inset).toBeGreaterThanOrEqual(12);
    expect(inset).toBeLessThanOrEqual(12.5);
    expect([style.fontSize, style.fontWeight]).toStrictEqual([`15px`, `600`]);
    expect(
      second.getBoundingClientRect().left - first.getBoundingClientRect().right
    ).toBe(8);
  });
});

describe(`the iOS layout's galleries`, () => {
  const gallery = (
    items: MediaGalleryItem[]
  ): { root: HTMLElement; box: DOMRect; content: DOMRect } => {
    const root = mountPhone(
      inCard(text(`x`), { type: ComponentType.MediaGallery, items })
    );
    return {
      root,
      box: rect(root, galleryStyles.gallery),
      content: rect(root, textStyles.textDisplay)
    };
  };

  it.each([
    [2, [picture(256, 144), picture(336, 144)]],
    [3, [picture(128, 128), picture(128, 128), picture(128, 128)]],
    [4, [picture(88, 64), picture(88, 64), picture(128, 128), picture(32, 32)]]
  ])(
    `puts %i pictures of any sizes in one box 4 points narrower than the column and 273 by 181 in shape, as every capture of two, three and four shows`,
    (_, items) => {
      const { box, content } = gallery(items);
      expect(box.width).toBeCloseTo(content.width - 4, 1);
      expect(box.left - content.left).toBeCloseTo(2, 1);
      expect(box.width / box.height).toBeCloseTo(273 / 181, 2);
    }
  );

  it(`splits the box for three into a square beside two stacked, as tome-023 shows (181 beside 88 and 88)`, () => {
    const { root, box } = gallery([
      picture(128, 128),
      picture(128, 128),
      picture(128, 128)
    ]);
    const items = [
      ...root.querySelectorAll<HTMLElement>(byClass(galleryStyles.item))
    ].map((item) => item.getBoundingClientRect());
    expect(items[0].width).toBeCloseTo(box.height, 0);
    expect(items[0].height).toBeCloseTo(box.height, 0);
    expect(items[1].height).toBeCloseTo((box.height - 4) / 2, 0);
  });

  it(`draws a lone small picture at its file's own size, never scaled up (tome-023: 256×144 drawn 256×144)`, () => {
    const { root } = gallery([picture(256, 144)]);
    const item = rect(root, galleryStyles.single);
    expect([item.width, item.height]).toStrictEqual([256, 144]);
  });

  it(`marks a described picture with an ALT badge at its bottom left, as the app does and desktop does not`, () => {
    const { root } = gallery([
      picture(256, 144, `A planet`),
      picture(256, 144)
    ]);
    const badges = root.querySelectorAll(byClass(galleryStyles.altBadge));
    expect(badges).toHaveLength(1);
    const badge = badges[0].getBoundingClientRect();
    const item = rect(root, galleryStyles.item);
    expect(badge.left - item.left).toBe(7);
    expect(item.bottom - badge.bottom).toBe(10);
    expect(badges[0].textContent).toBe(`ALT`);

    const desktop = mountScene({
      messages: [
        {
          payload: {
            flags: 1 << 15,
            components: inCard({
              type: ComponentType.MediaGallery,
              items: [picture(256, 144, `A planet`)]
            })
          }
        }
      ]
    });
    expect(
      desktop.querySelectorAll(byClass(galleryStyles.altBadge))
    ).toHaveLength(0);
  });
});

describe(`the iOS layout's sections`, () => {
  it(`draws a thumbnail 60 points square at the column's right edge, as tome-028 and tome-029 show, where desktop's is 85`, () => {
    const root = mountPhone(
      inCard({
        type: ComponentType.Section,
        components: [text(`**A. Saturn**`)],
        accessory: {
          type: ComponentType.Thumbnail,
          media: { url: `https://cdn.example/t.png` }
        }
      })
    );
    const thumbnail = rect(root, thumbnailStyles.thumbnail);
    expect([thumbnail.width, thumbnail.height]).toStrictEqual([60, 60]);
    const card = rect(root, containerStyles.container);
    expect(card.right - thumbnail.right).toBeGreaterThanOrEqual(16);
    expect(card.right - thumbnail.right).toBeLessThanOrEqual(16.5);
  });
});
