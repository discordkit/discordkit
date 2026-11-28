import { describe, expect, it } from "vite-plus/test";
import type { Button } from "@discordkit/client/components/types/Button";
import { ButtonStyle } from "@discordkit/client/components/types/ButtonStyle";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import { dark, expectColor, mountComponents } from "./mount.js";

/**
 * Buttons are how both bots take answers, and their label shape and wrapping were among the things that kept changing. Values from Discord build 679963: the shared button at its small size (32px tall, at least 60px wide, 3px by 11px padding, 14px medium text on an 18px line, 8px radius), each style's fill, 50% opacity when disabled, and an action row's 8px gap with wrapping.
 */

const button = (overrides: Partial<Button> = {}): Button => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  label: `Fallen Sky`,
  customId: `vote`,
  ...overrides
});

/** Mounts one action row of `buttons` and returns the drawn buttons. */
const mountRow = (
  buttons: Button[],
  scene: Parameters<typeof mountComponents>[1] = {}
): HTMLButtonElement[] => [
  ...mountComponents(
    [{ type: ComponentType.ActionRow, components: buttons }],
    scene
  ).querySelectorAll(`button`)
];

const style = (element: Element): CSSStyleDeclaration =>
  getComputedStyle(element);

describe(`a button`, () => {
  it(`is Discord's small button: 32px tall, 8px radius, padded 3px by 11px inside its 1px border`, () => {
    const [drawn] = mountRow([button()]);
    const computed = style(drawn);
    expect(drawn.getBoundingClientRect().height).toBe(32);
    expect(computed.borderTopLeftRadius).toBe(`8px`);
    expect([computed.paddingTop, computed.paddingLeft]).toStrictEqual([
      `3px`,
      `11px`
    ]);
    expect(computed.borderTopWidth).toBe(`1px`);
  });

  it(`sets its label at 14px medium weight on an 18px line, on one line`, () => {
    const [drawn] = mountRow([button()]);
    expect(style(drawn).fontSize).toBe(`14px`);
    expect(style(drawn).fontWeight).toBe(`500`);
    expect(style(drawn).lineHeight).toBe(`18px`);
    expect(drawn.textContent).toBe(`Fallen Sky`);
  });

  it(`is never narrower than 60px, so a one-letter answer button is still a comfortable target`, () => {
    const [drawn] = mountRow([button({ label: `A` })]);
    expect(drawn.getBoundingClientRect().width).toBe(60);
  });

  it.each([
    [`Primary`, ButtonStyle.Primary, dark.brand, dark.white, dark.buttonBorder],
    [
      `Secondary`,
      ButtonStyle.Secondary,
      dark.secondaryButton,
      dark.secondaryButtonText,
      dark.borderMuted
    ],
    [
      `Success`,
      ButtonStyle.Success,
      dark.successButton,
      dark.white,
      dark.buttonBorder
    ],
    [
      `Danger`,
      ButtonStyle.Danger,
      dark.dangerButton,
      dark.white,
      dark.buttonBorder
    ]
  ] as const)(
    `fills a %s button with Discord's colour for it`,
    (_, buttonStyle, fill, text, border) => {
      const [drawn] = mountRow([button({ style: buttonStyle })]);
      expectColor(style(drawn).backgroundColor, fill);
      expectColor(style(drawn).color, text);
      expectColor(style(drawn).borderTopColor, border);
    }
  );

  it(`draws a disabled button at half opacity, keeping its fill, as Inbou's closed cards show`, () => {
    const [drawn] = mountRow([button({ disabled: true })]);
    expect(drawn.disabled).toBe(true);
    expect(style(drawn).opacity).toBe(`0.5`);
    expectColor(style(drawn).backgroundColor, dark.secondaryButton);
  });

  it(`draws a Link button grey, with an external-link mark 8px after its label`, () => {
    const [drawn] = mountRow([
      {
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        label: `Fallen Sky`,
        url: `https://example.com`
      }
    ]);
    expectColor(style(drawn).backgroundColor, dark.secondaryButton);
    const mark = drawn.querySelector(`svg`);
    if (!mark) throw new Error(`No external-link mark was drawn.`);
    expect(mark.previousElementSibling?.textContent).toBe(`Fallen Sky`);
    expect(style(mark).marginLeft).toBe(`8px`);
  });

  it(`draws a Premium button blurple with a shop icon and the SKU's name and price from the scene`, () => {
    const [drawn] = mountRow(
      [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Premium,
          skuId: `9`
        }
      ],
      { context: { skus: { "9": { name: `Hint pack`, price: `$0.99` } } } }
    );
    expectColor(style(drawn).backgroundColor, dark.brand);
    expect(drawn.querySelector(`svg`)).not.toBeNull();
    expect(drawn.textContent).toBe(`Hint pack · $0.99`);
  });

  it(`puts an emoji 4px before the label, at the inline emoji size`, () => {
    const [drawn] = mountRow([button({ emoji: { id: null, name: `🔥` } })]);
    const image = drawn.querySelector(`img`);
    const holder = image?.parentElement;
    if (!image || !holder) throw new Error(`No emoji was drawn.`);
    expect(image.alt).toBe(`🔥`);
    expect(style(holder).marginRight).toBe(`4px`);
    // 1.375em of the button's 14px.
    expect(image.getBoundingClientRect().width).toBeCloseTo(19.25, 2);
  });

  it(`centres an emoji on a button with no label, with no margin after it`, () => {
    const [drawn] = mountRow([
      {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        customId: `again`,
        emoji: { id: `5`, name: `gem` }
      }
    ]);
    const image = drawn.querySelector(`img`);
    const holder = image?.parentElement;
    if (!image || !holder) throw new Error(`No emoji was drawn.`);
    expect(image.alt).toBe(`:gem:`);
    expect(style(holder).marginRight).toBe(`0px`);
    expect(drawn.getBoundingClientRect().width).toBe(60);
  });
});

describe(`an action row`, () => {
  const five = [
    `Fallen Sky`,
    `Black Hole`,
    `Meteor Hammer`,
    `Starstorm`,
    `Moonfall`
  ].map((label) => button({ label }));

  it(`spaces its buttons 8px apart on one line when they fit`, () => {
    const [first, second] = mountRow(five.slice(0, 2));
    expect(
      second.getBoundingClientRect().left - first.getBoundingClientRect().right
    ).toBe(8);
    expect(second.getBoundingClientRect().top).toBe(
      first.getBoundingClientRect().top
    );
  });

  it(`wraps five buttons in a narrow column onto further lines 8px below, as Discord does on a phone-width chat`, () => {
    const drawn = mountRow(five, { width: 360 });
    const tops = [
      ...new Set(drawn.map((each) => each.getBoundingClientRect().top))
    ];
    expect(tops.length).toBeGreaterThan(1);
    expect(tops[1] - tops[0]).toBe(32 + 8);
    // Nothing spills past the column.
    for (const each of drawn) {
      expect(each.getBoundingClientRect().right).toBeLessThanOrEqual(360);
    }
  });
});
