import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";
import tokens from "../../react/tokens.module.css";
import type { Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * Studio in a real browser, on a stand-in for the file bridge that records every write and can announce a change "on disk" at any moment. These specs hold the editor to what a person working beside an agent relies on: the preview follows the file, their edits reach it, text that does not parse never does, a change from outside never silently replaces what they typed, and the preview is drawn exactly as `render` draws it, untouched by Studio's own styles.
 */

interface FakeFile {
  backend: Backend;
  saves: string[];
  /** Changes the file "on disk", as an agent would. */
  change: (text: string) => void;
}

const fakeFile = (initial: string): FakeFile => {
  let text = initial;
  let version = 1;
  const saves: string[] = [];
  const listeners = new Set<(snapshot: FileSnapshot) => void>();
  const snapshot = (): FileSnapshot => ({
    exists: true,
    name: `card.json`,
    path: `/work/card.json`,
    version: String(version),
    text
  });
  return {
    saves,
    change: (next) => {
      text = next;
      version++;
      for (const listener of listeners) listener(snapshot());
    },
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
      subscribe: (onChange) => {
        listeners.add(onChange);
        return () => listeners.delete(onChange);
      },
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

const payload = (content: string): string =>
  json({ flags: 32768, components: [{ type: 10, content }] });

/** The first viewport's drawing. */
const preview = (): HTMLElement => {
  const element = document.querySelector(`[data-testid="preview-viewport"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No preview.`);
  return element;
};

const sceneRoot = (): HTMLElement => {
  const element = document.querySelector(`[data-discordkit-preview-scene]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No scene drawn.`);
  return element;
};

/** The JSON pane's text area. Studio opens on the Edit tab, so the JSON tab is shown first (see `showJson`). */
const editor = (): HTMLTextAreaElement => {
  const element = page.getByRole(`textbox`, { name: `Scene JSON` }).element();
  if (!(element instanceof HTMLTextAreaElement)) throw new Error(`No editor.`);
  return element;
};

const showJson = async (): Promise<void> => {
  await userEvent.click(page.getByRole(`tab`, { name: `JSON` }));
};

/** Replaces the editor's text as typing would, through React's change handling. */
const typeInto = async (text: string): Promise<void> => {
  await showJson();
  await userEvent.clear(editor());
  await userEvent.fill(editor(), text);
};

const drawn = async (text: string): Promise<void> => {
  await vi.waitFor(() => expect(preview().textContent).toContain(text));
};

describe(`the Studio editor`, () => {
  it(`draws the file, and follows a change made to it on disk`, async () => {
    const file = fakeFile(payload(`From the agent`));
    mount(file.backend);
    await drawn(`From the agent`);
    file.change(payload(`Changed on disk`));
    await drawn(`Changed on disk`);
    await showJson();
    expect(editor().value).toBe(payload(`Changed on disk`));
    expect(file.saves).toEqual([]);
  });

  it(`writes the JSON pane's text to the file once it parses, and never before`, async () => {
    const file = fakeFile(payload(`Before`));
    mount(file.backend);
    await drawn(`Before`);
    await typeInto(`{ "flags": 32768, "components": [`);
    await expect.element(page.getByText(/Line 1, column \d+:/)).toBeVisible();
    // The preview keeps the last text that parsed.
    expect(preview().textContent).toContain(`Before`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(file.saves).toEqual([]);
    await typeInto(payload(`After`));
    await drawn(`After`);
    await vi.waitFor(() => expect(file.saves).toEqual([payload(`After`)]));
  });

  it(`keeps unsaved text when the file changes under it, and says so`, async () => {
    const file = fakeFile(payload(`Before`));
    mount(file.backend);
    await drawn(`Before`);
    await typeInto(`{ "half typed": `);
    file.change(payload(`The agent's change`));
    await expect
      .element(page.getByText(/changed on disk while you had unsaved edits/))
      .toBeVisible();
    expect(editor().value).toBe(`{ "half typed": `);
    await drawn(`The agent's change`);
    await userEvent.click(page.getByRole(`button`, { name: /Discard mine/ }));
    await vi.waitFor(() =>
      expect(editor().value).toBe(payload(`The agent's change`))
    );
    expect(file.saves).toEqual([]);
  });

  it(`lets the person overwrite the agent's change, but only when they choose to`, async () => {
    const file = fakeFile(payload(`Before`));
    mount(file.backend);
    await drawn(`Before`);
    await typeInto(`{ "half typed": `);
    file.change(payload(`The agent's change`));
    await expect
      .element(page.getByRole(`button`, { name: /Overwrite the file/ }))
      .toBeDisabled();
    await typeInto(payload(`Mine`));
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(file.saves).toEqual([]);
    await userEvent.click(
      page.getByRole(`button`, { name: /Overwrite the file/ })
    );
    await vi.waitFor(() => expect(file.saves).toEqual([payload(`Mine`)]));
  });

  it(`writes a preview setting into a scene file, in the file's key style`, async () => {
    const file = fakeFile(
      json({ messages: [{ payload: { content: `Hi` } }], time_zone: `UTC` })
    );
    mount(file.backend);
    await drawn(`Hi`);
    await userEvent.click(page.getByRole(`radio`, { name: `Light` }));
    await vi.waitFor(() => expect(file.saves).toHaveLength(1));
    expect(JSON.parse(file.saves[0])).toEqual({
      messages: [{ payload: { content: `Hi` } }],
      time_zone: `UTC`,
      theme: `light`
    });
    expect(sceneRoot().classList).toContain(tokens.light);
  });

  it(`applies a preview setting to a bare payload without writing it, and says why`, async () => {
    const file = fakeFile(payload(`Hi`));
    mount(file.backend);
    await drawn(`Hi`);
    await userEvent.click(page.getByText(`Member list`, { exact: true }));
    // Closing the member list gives its 264 pixels to the chat.
    await vi.waitFor(() => expect(sceneRoot().style.width).toBe(`996px`));
    await expect
      .element(
        page.getByText(/Not written to the file: it holds a message payload/)
      )
      .toBeVisible();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(file.saves).toEqual([]);
  });

  it(`can be driven from the keyboard: the theme changes with the arrow keys`, async () => {
    const file = fakeFile(payload(`Hi`));
    mount(file.backend);
    await drawn(`Hi`);
    page.getByRole(`radio`, { name: `Dark` }).element().focus();
    await userEvent.keyboard(`{ArrowRight}`);
    await userEvent.keyboard(`{Enter}`);
    await vi.waitFor(() =>
      expect(sceneRoot().classList).toContain(tokens.onyx)
    );
  });

  it(`shows lint's findings with paths spelled as the file spells them, and the overall state`, async () => {
    const file = fakeFile(
      json({
        flags: 32768,
        components: [
          {
            type: 1,
            components: [{ type: 2, style: 5, label: `Link`, custom_id: `x` }]
          }
        ]
      })
    );
    mount(file.backend);
    await expect.element(page.getByText(/1 error/).first()).toBeVisible();
    // Below 1280 pixels, as in the test browser's window, the findings share a tab strip with the JSON.
    await userEvent.click(page.getByRole(`tab`, { name: /Findings/ }));
    await expect
      .element(page.getByText(`button-style-fields`).first())
      .toBeVisible();
    await expect
      .element(page.getByText(`components[0].components[0]`).first())
      .toBeVisible();
    await expect.element(page.getByText(/1 error/).first()).toBeVisible();
  });

  it(`says a scene cannot be drawn, and why, instead of drawing part of it`, async () => {
    const file = fakeFile(
      json({
        messages: [
          {
            payload: { flags: 32768, components: [{ type: 10, content: `x` }] },
            openSelect: `missing`
          }
        ]
      })
    );
    mount(file.backend);
    await expect
      .element(page.getByText(`Cannot be drawn`).first())
      .toBeVisible();
    // Every viewport says so.
    await expect
      .element(page.getByText(/This scene cannot be drawn/).first())
      .toBeVisible();
  });

  it(`keeps Studio's own text styles out of the preview, so it is drawn as render draws it`, async () => {
    const file = fakeFile(payload(`Hi`));
    mount(file.backend);
    await drawn(`Hi`);
    // Studio's body text is 13px; the page the Node renderer draws into starts at the browser's 16px.
    expect(getComputedStyle(document.body).fontSize).toBe(`13px`);
    expect(getComputedStyle(preview()).fontSize).toBe(`16px`);
    expect(getComputedStyle(sceneRoot()).fontFamily).toMatch(
      /^"?Noto Sans Variable/
    );
  });
});
