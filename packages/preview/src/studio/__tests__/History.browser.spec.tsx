import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * Undo and redo in the app: one history for the forms, the tree, the JSON pane, the preview settings and the changes that arrive from the file. What a person relies on: a burst of typing is one step, undo is never a surprise (an agent's change is undone only by name, or by a second key press that has said which change it is), and nothing undo writes lands on top of a change on disk the tab has not seen.
 */

interface FakeFile {
  backend: Backend;
  saves: { text: string; baseVersion: string }[];
  text: () => string;
  change: (text: string) => void;
  /** Changes the file without the change stream saying so yet. */
  changeUnannounced: (text: string) => void;
}

const fakeFile = (initial: string): FakeFile => {
  let text = initial;
  let version = 1;
  const saves: FakeFile[`saves`] = [];
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
    text: () => text,
    change: (next) => {
      text = next;
      version++;
      for (const listener of listeners) listener(snapshot());
    },
    changeUnannounced: (next) => {
      text = next;
      version++;
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
        saves.push({ text: next, baseVersion });
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

const card = (content: string, extra: Record<string, unknown> = {}): string =>
  json({
    messages: [
      {
        payload: {
          flags: 32768,
          components: [{ type: 10, content }]
        }
      }
    ],
    ...extra
  });

const contentOf = (text: string): string =>
  (
    JSON.parse(text) as {
      messages: [{ payload: { components: [{ content: string }] } }];
    }
  ).messages[0].payload.components[0].content;

const preview = (): string =>
  document.querySelector(`[data-testid="preview-viewport"]`)?.textContent ?? ``;

const drawn = async (text: string): Promise<void> => {
  await vi.waitFor(() => expect(preview()).toContain(text));
};

const content = () => page.getByRole(`textbox`, { name: `Content` });

describe(`undo and redo`, () => {
  it(`takes back a burst of typing in a field as one step, and brings it back`, async () => {
    const file = fakeFile(card(`Before`));
    mount(file.backend);
    await drawn(`Before`);
    await userEvent.click(page.getByRole(`row`, { name: /^Text Display/ }));
    await userEvent.fill(content(), `After`);
    await userEvent.type(content(), ` all`);
    await vi.waitFor(() => expect(contentOf(file.text())).toBe(`After all`));
    await userEvent.click(
      page.getByRole(`button`, { name: `Undo Edit Content` })
    );
    await drawn(`Before`);
    await vi.waitFor(() => expect(contentOf(file.text())).toBe(`Before`));
    await expect.element(content()).toHaveValue(`Before`);
    await userEvent.click(
      page.getByRole(`button`, { name: `Redo Edit Content` })
    );
    await vi.waitFor(() => expect(contentOf(file.text())).toBe(`After all`));
  });

  it(`names an agent's change on the undo button, and from the keyboard says which change it is before undoing it`, async () => {
    const file = fakeFile(card(`Mine`));
    mount(file.backend);
    await drawn(`Mine`);
    file.change(card(`The agent's`));
    await drawn(`The agent's`);
    await expect
      .element(page.getByRole(`button`, { name: `Undo Change on disk` }))
      .toBeEnabled();
    // The first press only says which change the next one would take back.
    page
      .getByRole(`row`, { name: /^Text Display/ })
      .element()
      .focus();
    await userEvent.keyboard(`{Control>}z{/Control}`);
    await expect
      .element(
        page.getByText(/The last change came from the file \(Change on disk/)
      )
      .toBeVisible();
    expect(file.text()).toBe(card(`The agent's`));
    await userEvent.keyboard(`{Control>}z{/Control}`);
    await drawn(`Mine`);
    // Written on top of the version the tab had seen, which is the agent's.
    await vi.waitFor(() => expect(file.saves.at(-1)?.baseVersion).toBe(`2`));
    expect(contentOf(file.text())).toBe(`Mine`);
  });

  it(`does not let an undo overwrite a change on disk the tab has not seen: the write is refused and the person chooses`, async () => {
    const file = fakeFile(card(`One`));
    mount(file.backend);
    await drawn(`One`);
    await userEvent.click(page.getByRole(`row`, { name: /^Text Display/ }));
    await userEvent.fill(content(), `Two`);
    await vi.waitFor(() => expect(contentOf(file.text())).toBe(`Two`));
    // The agent writes, but the tab has not heard of it yet: the change stream is slower than the person.
    const unseen = card(`The agent's newer`);
    file.changeUnannounced(unseen);
    await userEvent.click(
      page.getByRole(`button`, { name: `Undo Edit Content` })
    );
    await expect
      .element(page.getByRole(`button`, { name: `Load the file` }))
      .toBeVisible();
    expect(file.text()).toBe(unseen);
    await drawn(`The agent's newer`);
  });

  it(`undoes a structural edit without asking first: a removed component comes back`, async () => {
    const file = fakeFile(card(`Keep me`));
    mount(file.backend);
    await drawn(`Keep me`);
    await userEvent.click(page.getByRole(`row`, { name: /^Text Display/ }));
    await userEvent.keyboard(`{Delete}`);
    await vi.waitFor(() => expect(preview()).not.toContain(`Keep me`));
    await expect.element(page.getByRole(`alertdialog`)).not.toBeInTheDocument();
    await userEvent.keyboard(`{Control>}z{/Control}`);
    await drawn(`Keep me`);
    // Focus is not left on nothing: it is somewhere in the app a keyboard can go on from.
    expect(document.activeElement).not.toBe(document.body);
  });

  it(`keeps focus in the app when an undo takes away the field that had it, on the tree's selected row`, async () => {
    const file = fakeFile(card(`Keep me`));
    mount(file.backend);
    await drawn(`Keep me`);
    await userEvent.click(page.getByRole(`row`, { name: /^Text Display/ }));
    await userEvent.click(page.getByRole(`button`, { name: /^Add/ }));
    await userEvent.click(
      page
        .getByRole(`group`, { name: /^After it/ })
        .getByRole(`menuitem`, { name: `Text Display`, exact: true })
    );
    // The new text display's field has the cursor; undoing the add removes it.
    await expect.element(content()).toHaveFocus();
    await userEvent.keyboard(`{Control>}z{/Control}`);
    await vi.waitFor(() =>
      expect(document.activeElement?.getAttribute(`role`)).toBe(`row`)
    );
    expect(document.activeElement?.getAttribute(`aria-selected`)).toBe(`true`);
  });

  it(`covers a preview setting a bare payload has no place for, though nothing is written`, async () => {
    const file = fakeFile(json({ content: `Hello` }));
    mount(file.backend);
    await drawn(`Hello`);
    await userEvent.click(page.getByRole(`radio`, { name: `Light` }));
    await expect
      .element(page.getByRole(`radio`, { name: `Light` }))
      .toBeChecked();
    await userEvent.click(
      page.getByRole(`button`, { name: `Undo Change the theme` })
    );
    await expect
      .element(page.getByRole(`radio`, { name: `Dark` }))
      .toBeChecked();
    expect(file.saves).toEqual([]);
  });

  it(`lists the steps, the person's and the file's, newest first, with where the document is now`, async () => {
    const file = fakeFile(card(`A`));
    mount(file.backend);
    await drawn(`A`);
    await userEvent.click(page.getByRole(`row`, { name: /^Text Display/ }));
    await userEvent.fill(content(), `B`);
    await vi.waitFor(() => expect(contentOf(file.text())).toBe(`B`));
    file.change(card(`C`));
    await drawn(`C`);
    await userEvent.click(
      page.getByRole(`button`, { name: `Show the history` })
    );
    const steps = page.getByRole(`list`, { name: `Steps, newest first` });
    await expect.element(steps).toBeVisible();
    const items = steps.getByRole(`listitem`).elements();
    expect(
      items.map((item) => item.textContent?.replace(/\d\d:\d\d:\d\d.*$/, ``))
    ).toEqual([`From the fileChange on disk`, `YouEdit Content`]);
    expect(items[0].getAttribute(`aria-current`)).toBe(`step`);
    await userEvent.keyboard(`{Escape}`);
  });
});
