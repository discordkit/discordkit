import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * Modals in Studio, on a stand-in for the file bridge: a scene's modal is a row in the tree beside its messages, its components are rows under it (a Label's field under the Label), each has a form whose edits reach the file, the add menu offers only what a modal can hold, and the preview draws the modal over the messages.
 */

interface FakeFile {
  backend: Backend;
  saves: string[];
}

const fakeFile = (initial: string): FakeFile => {
  let text = initial;
  let version = 1;
  const saves: string[] = [];
  const snapshot = (): FileSnapshot => ({
    exists: true,
    name: `scene.json`,
    path: `/work/scene.json`,
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

/** A message with a button, and the modal it opens, in Discord's snake_case as an agent would write it. */
const scene = `${JSON.stringify(
  {
    messages: [
      {
        payload: {
          flags: 32768,
          components: [
            {
              type: 1,
              components: [
                { type: 2, style: 1, label: `Report`, custom_id: `open` }
              ]
            }
          ]
        }
      }
    ],
    modal: {
      payload: {
        custom_id: `report`,
        title: `Report a bug`,
        components: [
          {
            type: 18,
            label: `Where?`,
            component: {
              type: 21,
              custom_id: `area`,
              options: [
                { label: `Quiz`, value: `quiz` },
                { label: `Packs`, value: `packs` }
              ]
            }
          }
        ]
      }
    }
  },
  null,
  2
)}\n`;

const row = (name: RegExp) => page.getByRole(`row`, { name });

const lastSave = (file: FakeFile): Record<string, unknown> => {
  const save = file.saves.at(-1);
  if (save === undefined) throw new Error(`Nothing was saved.`);
  return JSON.parse(save) as Record<string, unknown>;
};

const preview = (): HTMLElement => {
  const element = document.querySelector(`[data-testid="preview-viewport"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No preview.`);
  return element;
};

describe(`a modal in Studio`, () => {
  it(`is a row in the tree with its fields under it, drawn in the preview over the message`, async () => {
    mount(fakeFile(scene).backend);
    await expect.element(row(/^Modal Report a bug/)).toBeVisible();
    await expect.element(row(/^Label Where\?/)).toBeVisible();
    await expect.element(row(/^Radio Group 2 options/)).toBeVisible();
    await vi.waitFor(() => {
      expect(preview().querySelector(`dialog`)?.textContent).toContain(
        `Report a bug`
      );
    });
  }, 30_000);

  it(`edits the modal's title and a Label's text, writing each to the file in the file's own spelling`, async () => {
    const file = fakeFile(scene);
    mount(file.backend);
    await userEvent.click(row(/^Modal Report a bug/));
    await userEvent.fill(
      page.getByRole(`textbox`, { name: `Title` }),
      `Report a problem`
    );
    await vi.waitFor(() =>
      expect(lastSave(file)).toMatchObject({
        modal: { payload: { custom_id: `report`, title: `Report a problem` } }
      })
    );
    await userEvent.click(row(/^Label Where\?/));
    await userEvent.fill(
      page.getByRole(`textbox`, { name: `Label` }),
      `Which part?`
    );
    await vi.waitFor(() =>
      expect(lastSave(file)).toMatchObject({
        modal: { payload: { components: [{ label: `Which part?` }] } }
      })
    );
  }, 30_000);

  it(`shows a finding on the field it is about`, async () => {
    mount(fakeFile(scene).backend);
    await userEvent.click(row(/^Modal Report a bug/));
    await userEvent.fill(
      page.getByRole(`textbox`, { name: `Title` }),
      `t`.repeat(46)
    );
    await expect
      .element(page.getByText(/over Discord's limit of 45/))
      .toBeVisible();
  }, 30_000);

  it(`offers only what a modal holds in the add menu, and adds a Label around a text input`, async () => {
    const file = fakeFile(scene);
    mount(file.backend);
    await userEvent.click(row(/^Modal Report a bug/));
    await userEvent.click(page.getByRole(`button`, { name: /^Add/ }));
    await expect
      .element(page.getByRole(`menuitem`, { name: /^Label/ }))
      .toBeVisible();
    await expect
      .element(page.getByRole(`menuitem`, { name: /^Text Display/ }))
      .toBeVisible();
    await expect
      .element(page.getByRole(`menuitem`, { name: /^Button/ }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole(`menuitem`, { name: /^Action Row/ }))
      .toHaveAttribute(`aria-disabled`, `true`);
    await userEvent.click(page.getByRole(`menuitem`, { name: /^Label/ }));
    await vi.waitFor(() =>
      expect(lastSave(file)).toMatchObject({
        modal: {
          payload: {
            components: [
              { type: 18 },
              { type: 18, component: { type: 4, style: 1 } }
            ]
          }
        }
      })
    );
  }, 30_000);

  it(`changes a Label's field to another kind, replacing it`, async () => {
    const file = fakeFile(scene);
    mount(file.backend);
    await userEvent.click(row(/^Label Where\?/));
    await userEvent.click(page.getByRole(`button`, { name: /Field/ }));
    await userEvent.click(page.getByRole(`option`, { name: /^Checkbox$/ }));
    await vi.waitFor(() =>
      expect(lastSave(file)).toMatchObject({
        modal: { payload: { components: [{ component: { type: 23 } }] } }
      })
    );
    await expect.element(row(/^Checkbox/)).toBeVisible();
  }, 30_000);
});
