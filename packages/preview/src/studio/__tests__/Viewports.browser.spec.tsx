import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * Studio's preview in several viewports at once. What a person relies on: a scene is shown on a desktop window and a phone side by side without asking, a phone never passes for the iOS app, each viewport's device can be chosen from a searchable list with the keyboard, the choice is saved into a scene file (and only there), and a selection made in one viewport shows in all of them.
 */

const fakeFile = (initial: string): { backend: Backend; saves: string[] } => {
  let text = initial;
  let version = 1;
  const saves: string[] = [];
  const snapshot = (): FileSnapshot => ({
    exists: true,
    name: `card.json`,
    path: `/work/card.json`,
    version: String(version),
    text
  });
  return {
    saves,
    backend: {
      kind: `file`,
      load: async () => {
        await Promise.resolve();
        return snapshot();
      },
      save: async (next, baseVersion): Promise<SaveResult> => {
        await Promise.resolve();
        if (baseVersion !== String(version)) {
          return { saved: false, current: snapshot(), message: `changed` };
        }
        saves.push(next);
        text = next;
        version++;
        return { saved: true, version: String(version) };
      },
      subscribe: () => () => undefined,
      attachmentUrl: () => null
    }
  };
};

const mount = (backend: Backend): void => {
  const host = document.createElement(`div`);
  document.body.append(host);
  const root = createRoot(host);
  onTestFinished(() => {
    root.unmount();
    host.remove();
  });
  flushSync(() => root.render(<Studio backend={backend} />));
};

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const card = {
  flags: 32768,
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `Question 4` },
        {
          type: 1,
          components: [{ type: 2, style: 2, label: `Answer`, custom_id: `a` }]
        }
      ]
    }
  ]
};

const scene = (extra: Record<string, unknown> = {}): string =>
  json({ messages: [{ payload: card }], ...extra });

/** Each viewport's drawn scene, in order. */
const drawings = (): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>(
    `[data-testid="preview-viewport"] [data-discordkit-preview-scene]`
  )
];

const widths = (): string[] => drawings().map((root) => root.style.width);

const drawn = async (count: number): Promise<void> => {
  await vi.waitFor(() => expect(drawings()).toHaveLength(count));
};

describe(`the preview's viewports`, () => {
  it(`shows a scene that names none on a desktop window and the iPhone 14 Pro side by side, and says the phone is the web layout, not the app`, async () => {
    mount(fakeFile(scene()).backend);
    await drawn(2);
    // A 1280-pixel window with the member list open leaves 732 pixels for the chat; the phone's chat is its screen.
    expect(widths()).toStrictEqual([`732px`, `393px`]);
    const text = (name: string): string =>
      page.getByRole(`region`, { name }).element().textContent;
    expect(text(`iPhone 14 Pro viewport`)).toMatch(
      /Web layout, not the app\. Drawn with Discord's desktop web layout at 393 pixels wide, not as the iOS app draws it\./
    );
    expect(text(`Laptop 1280 × 800 viewport`)).not.toMatch(/not the app/);
  });

  it(`keeps a scene's width as one free-width viewport`, async () => {
    mount(fakeFile(scene({ width: 480 })).backend);
    await drawn(1);
    expect(widths()).toStrictEqual([`480px`]);
  });

  it(`chooses a device from a searchable list with the keyboard alone, and saves it into the scene file in place of its width`, async () => {
    const file = fakeFile(scene({ width: 480 }));
    mount(file.backend);
    await drawn(1);
    page
      .getByRole(`button`, { name: /Device/ })
      .element()
      .focus();
    await userEvent.keyboard(`{Enter}`);
    await expect
      .element(page.getByRole(`searchbox`, { name: `Search devices` }))
      .toHaveFocus();
    await userEvent.keyboard(`pixel 7`);
    await expect
      .element(page.getByRole(`option`, { name: /iPhone/ }))
      .not.toBeInTheDocument();
    await userEvent.keyboard(`{ArrowDown}{Enter}`);
    await vi.waitFor(() => expect(widths()).toStrictEqual([`412px`]));
    await vi.waitFor(() => expect(file.saves).toHaveLength(1));
    const saved = JSON.parse(file.saves[0]) as Record<string, unknown>;
    expect(saved.viewports).toStrictEqual([{ device: `pixel-7` }]);
    expect(saved).not.toHaveProperty(`width`);
  });

  it(`groups the devices by platform, with a free width first`, async () => {
    mount(fakeFile(scene()).backend);
    await drawn(2);
    await userEvent.click(page.getByRole(`button`, { name: /Device/ }).first());
    const list = page.getByRole(`listbox`);
    await expect.element(list).toBeVisible();
    const options = list.getByRole(`option`).elements();
    expect(options[0]?.textContent).toMatch(/^Responsive/);
    for (const group of [`Desktop windows`, `iOS`, `Android`]) {
      await expect
        .element(list.getByText(group, { exact: true }))
        .toBeVisible();
    }
    await userEvent.keyboard(`{Escape}`);
  });

  it(`adds and removes viewports, and sets a free width`, async () => {
    const file = fakeFile(scene());
    mount(file.backend);
    await drawn(2);
    await userEvent.click(page.getByRole(`button`, { name: `New viewport` }));
    await drawn(3);
    await userEvent.click(
      page.getByRole(`button`, { name: `Remove the iPhone 14 Pro viewport` })
    );
    await drawn(2);
    await vi.waitFor(() => {
      const saved = JSON.parse(file.saves.at(-1) ?? `{}`) as {
        viewports?: { device?: string }[];
      };
      expect(saved.viewports?.map((viewport) => viewport.device)).toStrictEqual(
        [`desktop-1280x800`, `desktop-1920x1080`]
      );
    });
    // The last viewport cannot be removed: there would be nothing to draw.
    await userEvent.click(
      page.getByRole(`button`, {
        name: `Remove the Desktop 1920 × 1080 viewport`
      })
    );
    await drawn(1);
    await expect
      .element(page.getByRole(`button`, { name: /^Remove the/ }))
      .not.toBeInTheDocument();
    await userEvent.click(page.getByRole(`button`, { name: /Device/ }));
    await userEvent.click(page.getByRole(`option`, { name: /^Responsive/ }));
    // Switching to a free width starts at the chat column the device had, so nothing jumps.
    await vi.waitFor(() => expect(widths()).toStrictEqual([`732px`]));
    const width = page.getByRole(`textbox`, { name: `Width (px)` });
    await userEvent.clear(width);
    await userEvent.type(width, `500{Enter}`);
    await vi.waitFor(() => expect(widths()).toStrictEqual([`500px`]));
  });

  it(`selects a component clicked in any viewport and outlines it in every one`, async () => {
    mount(fakeFile(scene()).backend);
    await drawn(2);
    const phoneButton = page
      .getByTestId(`preview-viewport`)
      .nth(1)
      .getByRole(`button`, { name: `Answer` });
    await userEvent.click(phoneButton);
    await expect
      .element(page.getByRole(`textbox`, { name: `Label` }))
      .toHaveValue(`Answer`);
    // Each viewport's outline sits over its own drawing of the button, at that viewport's zoom.
    await vi.waitFor(() => {
      const panels = [
        ...document.querySelectorAll(`[data-testid="preview-viewport"]`)
      ];
      const outlines = [
        ...document.querySelectorAll(`[data-testid="selection-outline"]`)
      ];
      expect(outlines).toHaveLength(panels.length);
      panels.forEach((panel, index) => {
        const button = [...panel.querySelectorAll(`button`)].find(
          (element) => element.textContent === `Answer`
        );
        const target = button?.getBoundingClientRect();
        const outline = outlines[index];
        expect(outline.hasAttribute(`hidden`)).toBe(false);
        const box = outline.getBoundingClientRect();
        expect(Math.abs(box.left - (target?.left ?? -99))).toBeLessThan(1);
        expect(Math.abs(box.top - (target?.top ?? -99))).toBeLessThan(1);
        expect(Math.abs(box.width - (target?.width ?? -99))).toBeLessThan(1);
      });
    });
  });

  it(`names the pane by its own heading, so two panes would not share an id`, async () => {
    mount(fakeFile(scene()).backend);
    await drawn(2);
    const region = page.getByRole(`region`, { name: `Preview` }).element();
    const id = region.getAttribute(`aria-labelledby`);
    expect(id).not.toBe(`preview-heading`);
    expect(document.getElementById(id ?? ``)?.textContent).toBe(`Preview`);
  });
});
