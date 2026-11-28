import { afterEach, describe, expect, it } from "vite-plus/test";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Container as ContainerComponent } from "@discordkit/client/components/types/Container";
import { Scene } from "../Scene.js";

/**
 * The renderer's whole value is looking like Discord, so these specs pin the container and its text to the values measured from Discord's own stylesheet (web client build 679963). Each one reads the computed style in a real browser, so it fails if the stylesheet drifts from those measurements, whatever the cause: a token renamed, a rule lost in the build, a cascade that stopped applying.
 */
describe(`a container in a message`, () => {
  const text = `Which hero is this?`;

  let root: Root | undefined;
  let host: HTMLElement | undefined;

  afterEach(() => {
    root?.unmount();
    host?.remove();
  });

  /** Renders one message holding `container` and returns the container and its text display. */
  const renderContainer = (
    container: Omit<ContainerComponent, `type` | `components`>
  ): { card: HTMLElement; textDisplay: HTMLElement } => {
    host = document.createElement(`div`);
    document.body.append(host);
    root = createRoot(host);
    flushSync(() => {
      root?.render(
        <Scene
          messages={[
            {
              payload: {
                components: [
                  {
                    type: ComponentType.Container,
                    ...container,
                    components: [
                      { type: ComponentType.TextDisplay, content: text }
                    ]
                  }
                ]
              }
            }
          ]}
        />
      );
    });
    const textDisplay = [...host.querySelectorAll(`div`)].find(
      (element) =>
        element.childElementCount === 0 && element.textContent === text
    );
    const card = textDisplay?.parentElement;
    if (!textDisplay || !card) throw new Error(`The fixture did not render.`);
    return { card, textDisplay };
  };

  it(`pads its content by Discord's 16px on every side`, () => {
    const { card } = renderContainer({});
    const style = getComputedStyle(card);
    expect([
      style.paddingTop,
      style.paddingRight,
      style.paddingBottom,
      style.paddingLeft
    ]).toEqual([`16px`, `16px`, `16px`, `16px`]);
  });

  it(`stacks its children with Discord's 8px gap`, () => {
    const { card } = renderContainer({});
    const style = getComputedStyle(card);
    expect(style.display).toBe(`flex`);
    expect(style.flexDirection).toBe(`column`);
    expect(style.rowGap).toBe(`8px`);
  });

  it(`rounds its corners by Discord's 8px radius`, () => {
    const { card } = renderContainer({});
    const style = getComputedStyle(card);
    expect([
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius
    ]).toEqual([`8px`, `8px`, `8px`, `8px`]);
  });

  it(`outlines itself with Discord's 1px solid subtle border`, () => {
    const { card } = renderContainer({});
    const style = getComputedStyle(card);
    expect(style.borderTopWidth).toBe(`1px`);
    expect(style.borderTopStyle).toBe(`solid`);
    // The subtle border is translucent in every theme; an opaque one would read as a heavier outline than Discord draws.
    expect(style.borderTopColor).toMatch(/^rgba\(.+, 0\.\d+\)$/);
  });

  it(`draws the accent as Discord's 4px bar down the full leading edge, in the payload's colour`, () => {
    const { card } = renderContainer({ accentColor: 0x5865f2 });
    const bar = getComputedStyle(card, `::before`);
    expect(bar.content).toBe(`""`);
    expect(bar.position).toBe(`absolute`);
    expect(bar.width).toBe(`4px`);
    // The bar spans the padding box: the card's height less its two 1px borders.
    expect(bar.height).toBe(`${card.getBoundingClientRect().height - 2}px`);
    expect(bar.left).toBe(`0px`);
    expect(bar.backgroundColor).toBe(`rgb(88, 101, 242)`);
  });

  it(`still draws the accent when the colour is black, since 0x000000 is a colour and not an absence`, () => {
    const { card } = renderContainer({ accentColor: 0x000000 });
    const bar = getComputedStyle(card, `::before`);
    expect(bar.width).toBe(`4px`);
    expect(bar.backgroundColor).toBe(`rgb(0, 0, 0)`);
  });

  it.each([undefined, null])(
    `draws no accent bar when the payload's colour is %s`,
    (accentColor) => {
      const { card } = renderContainer({ accentColor });
      expect(getComputedStyle(card, `::before`).content).toBe(`none`);
    }
  );

  it(`sets its text at Discord's reduced size: 0.875rem, with the markup line height scaled to match`, () => {
    const { textDisplay } = renderContainer({});
    const style = getComputedStyle(textDisplay);
    expect(style.fontSize).toBe(`14px`);
    // 1.375rem * 0.875 at a 16px root.
    expect(style.lineHeight).toBe(`19.25px`);
  });

  it(`keeps the payload's line breaks and spaces in its text, as Discord's markup does`, () => {
    const { textDisplay } = renderContainer({});
    expect(getComputedStyle(textDisplay).whiteSpace).toBe(`break-spaces`);
  });
});
