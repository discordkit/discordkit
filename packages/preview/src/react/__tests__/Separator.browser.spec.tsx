import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { Separator } from "@discordkit/client/components/types/Separator";
import textDisplayStyles from "../TextDisplay.module.css";
import { byClass, dark, expectColor, mountComponents } from "./mount.js";

/**
 * Both bots split their cards with a divider, and how much air it leaves is one of the things that took iterations to judge. Discord build 679963: a 1px `--background-mod-strong` line, no space of its own at small spacing (the container's 8px gap falls either side), and 8px more each side at large spacing.
 */
const between = (
  separator: Omit<Separator, `type`>
): {
  element: HTMLElement;
  gap: number;
} => {
  const root = mountComponents([
    {
      type: ComponentType.Container,
      components: [
        { type: ComponentType.TextDisplay, content: `above` },
        { type: ComponentType.Separator, ...separator },
        { type: ComponentType.TextDisplay, content: `below` }
      ]
    }
  ]);
  const [above, below] = root.querySelectorAll(
    byClass(textDisplayStyles.textDisplay)
  );
  const element = root.querySelector<HTMLElement>(`hr`);
  if (!element) throw new Error(`No separator was drawn.`);
  return {
    element,
    gap:
      below.getBoundingClientRect().top - above.getBoundingClientRect().bottom
  };
};

describe(`a separator`, () => {
  it(`draws a divider by default as a 1px line in the strong mod colour`, () => {
    const { element } = between({});
    const style = getComputedStyle(element);
    expect(style.borderBottomWidth).toBe(`1px`);
    expect(style.borderBottomStyle).toBe(`solid`);
    expectColor(style.borderBottomColor, dark.backgroundModStrong);
    expect(element.getBoundingClientRect().height).toBe(1);
  });

  it(`leaves the container's 8px gap above and below the line at small spacing, 17px between its neighbours`, () => {
    expect(between({ divider: true, spacing: 1 }).gap).toBe(17);
  });

  it(`adds 8px more on each side at large spacing, 33px between its neighbours`, () => {
    const { element, gap } = between({ divider: true, spacing: 2 });
    expect(getComputedStyle(element).marginTop).toBe(`8px`);
    expect(getComputedStyle(element).marginBottom).toBe(`8px`);
    expect(gap).toBe(33);
  });

  it(`draws no line without the divider, keeping only the space: 16px small, 32px large`, () => {
    const small = between({ divider: false });
    expect(getComputedStyle(small.element).borderBottomStyle).toBe(`none`);
    expect(small.gap).toBe(16);
    expect(between({ divider: false, spacing: 2 }).gap).toBe(32);
  });
});
