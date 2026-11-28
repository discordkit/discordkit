import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * A scene is a sequence of messages: a card and its closed state, a question and its answer. These specs hold Studio to what a person showing a sequence relies on: messages are added, copied, moved and removed like components, a copy is the way to show "before and after", each message's findings and limits are its own, and a file holding one bare payload is made a scene only when the person asks, after being told what that does.
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

interface SavedScene {
  messages: {
    author?: string;
    edited?: boolean;
    payload: { content?: string; flags?: number; components?: unknown[] };
  }[];
  theme?: string;
}

const saved = (file: FakeFile): SavedScene =>
  JSON.parse(file.saves.at(-1) ?? `{"messages":[]}`) as SavedScene;

const question = {
  author: `1`,
  payload: { content: `Question 4 is open.` }
};

const pair = json({
  messages: [question, { author: `1`, payload: { content: `Closed.` } }],
  context: { users: { "1": { name: `Inbou`, bot: true } } }
});

const row = (name: RegExp) => page.getByRole(`row`, { name });

describe(`several messages`, () => {
  it(`adds a message after the selected one, sent by the same author, and selects it`, async () => {
    const file = fakeFile(
      json({
        messages: [question],
        context: { users: { "1": { name: `Inbou`, bot: true } } }
      })
    );
    mount(file.backend);
    await userEvent.click(row(/^Message/));
    await userEvent.click(page.getByRole(`button`, { name: /^Add/ }));
    await userEvent.click(
      page.getByRole(`menuitem`, { name: /^Components V2 message/ })
    );
    await expect
      .element(row(/^Message 2 Components V2 · Inbou/))
      .toHaveAttribute(`aria-selected`, `true`);
    await vi.waitFor(() =>
      expect(saved(file).messages).toStrictEqual([
        question,
        { author: `1`, payload: { flags: 32768, components: [] } }
      ])
    );
  });

  it(`shows "before and after" with one duplicate and one switch: the copy marked edited, the original untouched`, async () => {
    const file = fakeFile(
      json({
        messages: [question],
        context: { users: { "1": { name: `Inbou`, bot: true } } }
      })
    );
    mount(file.backend);
    await userEvent.click(row(/^Message/));
    await userEvent.click(page.getByRole(`button`, { name: `Duplicate` }));
    await expect
      .element(row(/^Message 2/))
      .toHaveAttribute(`aria-selected`, `true`);
    // The switch's own input is visually hidden; its label is what a person clicks.
    await userEvent.click(page.getByText(`Edited`, { exact: true }));
    await vi.waitFor(() =>
      expect(saved(file).messages).toStrictEqual([
        question,
        { ...question, edited: true }
      ])
    );
    // The tree says which is which.
    await expect
      .element(row(/^Message 2 Classic · Inbou · edited/))
      .toBeVisible();
  });

  it(`moves a message with Alt+Arrow keys and removes it with Delete, with no confirmation since undo brings it back`, async () => {
    const file = fakeFile(pair);
    mount(file.backend);
    await userEvent.click(row(/^Message 2/));
    await userEvent.keyboard(`{Alt>}{ArrowUp}{/Alt}`);
    await vi.waitFor(() =>
      expect(
        saved(file).messages.map((message) => message.payload.content)
      ).toStrictEqual([`Closed.`, `Question 4 is open.`])
    );
    // Still selected and focused after the move: the selection follows the message.
    await expect.element(row(/^Message 1/)).toHaveFocus();
    await userEvent.keyboard(`{Delete}`);
    await vi.waitFor(() =>
      expect(
        saved(file).messages.map((message) => message.payload.content)
      ).toStrictEqual([`Question 4 is open.`])
    );
    await expect.element(page.getByRole(`alertdialog`)).not.toBeInTheDocument();
  });

  it(`keeps each message's findings and limits under its own name`, async () => {
    mount(
      fakeFile(
        json({
          messages: [
            { payload: { content: `` } },
            { payload: { content: `Fine` } }
          ]
        })
      ).backend
    );
    await userEvent.click(page.getByRole(`tab`, { name: /^Findings/ }));
    const findings = page.getByRole(`list`, { name: `Findings in Message 1` });
    await expect.element(findings).toBeVisible();
    await expect
      .element(page.getByRole(`list`, { name: `Findings in Message 2` }))
      .not.toBeInTheDocument();
    await expect
      .element(page.getByRole(`heading`, { name: `Message 2` }))
      .toBeVisible();
  });

  it(`offers no new message in a file holding one payload, and says how to make room for one`, async () => {
    mount(fakeFile(json({ content: `Hello` })).backend);
    await userEvent.click(row(/^Message/));
    await userEvent.click(page.getByRole(`button`, { name: /^Add/ }));
    const item = page.getByRole(`menuitem`, { name: /^Classic message/ });
    await expect.element(item).toHaveAttribute(`aria-disabled`, `true`);
    expect(item.element().textContent).toMatch(/Make it a scene first/);
    await userEvent.keyboard(`{Escape}`);
  });

  it(`makes a bare payload a scene only after saying what that does, keeping the theme chosen in Studio`, async () => {
    const file = fakeFile(json({ content: `Hello` }));
    mount(file.backend);
    await userEvent.click(page.getByRole(`radio`, { name: `Light` }));
    expect(file.saves).toHaveLength(0);
    await userEvent.click(row(/^Message/));
    await userEvent.click(
      page.getByRole(`button`, { name: `Convert to a scene…` }).first()
    );
    const dialog = page.getByRole(`alertdialog`);
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().textContent).toMatch(
      /rewrite it as a scene with that as its one message, at messages\[0\]\.payload/
    );
    // The least drastic choice has focus, and leaving changes nothing.
    await expect
      .element(dialog.getByRole(`button`, { name: `Keep it as it is` }))
      .toHaveFocus();
    await userEvent.click(
      dialog.getByRole(`button`, { name: `Make it a scene` })
    );
    await vi.waitFor(() =>
      expect(saved(file)).toStrictEqual({
        messages: [{ payload: { content: `Hello` } }],
        theme: `light`
      })
    );
    // Now it has room for an author.
    await expect
      .element(page.getByRole(`button`, { name: /Author/ }))
      .toBeEnabled();
  });
});
