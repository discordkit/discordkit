import { describe, expect, it } from "vite-plus/test";
import { ComponentType } from "@discordkit/client/components/types/ComponentType";
import type { MessageComponent } from "@discordkit/client/messages/types/MessageComponent";
import styles from "../FileAttachment.module.css";
import { byClass, dark, expectColor, find, mountComponents } from "./mount.js";

/**
 * A File component shows an uploaded file the way Discord shows any attachment that is not a picture. Values from Discord build 679963: a row up to 432px wide, padded 16px on the surface colour inside a 1px subtle border with 8px corners, a 30 by 40 icon 8px before the name, the name in the link colour, and the size in the muted colour under it.
 */

/** A File component as a request sends it, without `name` and `size`. The client's type requires them (a schema defect, fixed in #106), so it is cast. */
const fileComponent = (
  url: string,
  extra: Record<string, unknown> = {}
): MessageComponent[number] =>
  ({
    type: ComponentType.File,
    file: { url },
    ...extra
  }) as unknown as MessageComponent[number];

const mountFile = (
  component: MessageComponent[number],
  scene: Parameters<typeof mountComponents>[1] = {}
): HTMLElement =>
  find(mountComponents([component], scene), byClass(styles.fileWrapper));

const withSize = {
  context: {
    attachments: { "notes.txt": { path: `./notes.txt`, size: 1594 } }
  }
};

const box = (element: Element): DOMRect => element.getBoundingClientRect();

describe(`a file`, () => {
  it(`is a row padded 16px on the surface colour, in a 1px subtle border with 8px corners`, () => {
    const wrapper = mountFile(
      fileComponent(`attachment://notes.txt`),
      withSize
    );
    const row = find(wrapper, byClass(styles.file));
    const style = getComputedStyle(row);
    expect([style.paddingTop, style.paddingLeft]).toStrictEqual([
      `16px`,
      `16px`
    ]);
    expect(style.borderTopWidth).toBe(`1px`);
    expectColor(style.borderTopColor, dark.borderSubtle);
    expect(style.borderTopLeftRadius).toBe(`8px`);
    expectColor(style.backgroundColor, dark.backgroundSurfaceHigh);
  });

  it(`is 432px wide, as Discord's file attachments are, however short the name`, () => {
    const wrapper = mountFile(
      fileComponent(`attachment://notes.txt`),
      withSize
    );
    expect(box(wrapper).width).toBe(432);
  });

  it(`never spills past a phone-width column`, () => {
    const wrapper = mountFile(fileComponent(`attachment://notes.txt`), {
      ...withSize,
      width: 360
    });
    expect(box(wrapper).width).toBeLessThan(432);
    expect(box(wrapper).right).toBeLessThanOrEqual(360);
  });

  it(`draws a 30 by 40 file icon 8px before the name`, () => {
    const wrapper = mountFile(
      fileComponent(`attachment://notes.txt`),
      withSize
    );
    const icon = wrapper.querySelector(`svg`);
    const inner = find(wrapper, byClass(styles.fileInner));
    if (!icon) throw new Error(`No icon.`);
    expect([box(icon).width, box(icon).height]).toStrictEqual([30, 40]);
    expect(box(inner).left - box(icon).right).toBe(8);
  });

  it(`names the file after its attachment:// reference, in the link colour`, () => {
    const wrapper = mountFile(
      fileComponent(`attachment://notes.txt`),
      withSize
    );
    const name = find(wrapper, byClass(styles.filenameLinkWrapper));
    expect(name.textContent).toBe(`notes.txt`);
    expectColor(getComputedStyle(name).color, dark.textLink);
  });

  it(`writes the size from the scene's attachment entry under the name, muted`, () => {
    const wrapper = mountFile(
      fileComponent(`attachment://notes.txt`),
      withSize
    );
    const size = find(wrapper, byClass(styles.metadata));
    expect(size.textContent).toBe(`1.56 KB`);
    expectColor(getComputedStyle(size).color, dark.textMuted);
  });

  it(`prefers the name and size the payload carries, as Discord's responses do`, () => {
    const wrapper = mountFile(
      fileComponent(`attachment://notes.txt`, {
        name: `week-3-notes.txt`,
        size: 512
      }),
      withSize
    );
    expect(wrapper.textContent).toBe(`week-3-notes.txt512 bytes`);
  });

  it(`draws only the name when neither the payload nor the scene says how big the file is, rather than inventing a size`, () => {
    const wrapper = mountFile(fileComponent(`attachment://notes.txt`));
    expect(wrapper.querySelector(byClass(styles.metadata))).toBeNull();
    expect(wrapper.textContent).toBe(`notes.txt`);
  });

  it(`cuts a name too long for the row with an ellipsis, on one line`, () => {
    const name = `${`a-very-long-file-name-`.repeat(6)}.csv`;
    const wrapper = mountFile(fileComponent(`attachment://${name}`));
    const link = find(wrapper, byClass(styles.filenameLinkWrapper));
    expect(getComputedStyle(link).textOverflow).toBe(`ellipsis`);
    expect(link.scrollWidth).toBeGreaterThan(link.clientWidth);
    expect(box(link).height).toBe(20);
  });

  it(`blurs a spoilered file under a "Spoiler" pill until it is clicked`, () => {
    const wrapper = mountFile(
      fileComponent(`attachment://notes.txt`, { spoiler: true }),
      withSize
    );
    const row = find(wrapper, byClass(styles.file));
    const blurred = row.parentElement;
    const toggle = wrapper.querySelector(`input`);
    if (!blurred || !toggle) throw new Error(`No spoiler was drawn.`);
    expect(getComputedStyle(blurred).filter).toBe(`blur(44px)`);
    expect(wrapper.textContent).toContain(`Spoiler`);
    toggle.click();
    expect(getComputedStyle(blurred).filter).toBe(`none`);
  });
});
