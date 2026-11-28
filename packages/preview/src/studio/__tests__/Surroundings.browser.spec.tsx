import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";
import type { AttachmentStatus, Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * The scene's surroundings: who mentions and authors resolve to, and the files pictures name. A person usually meets them as a mention drawn "@unknown-user" or a picture drawn as a placeholder, so these specs hold Studio to making that one action away, keeping ids and file names exactly as typed (a snowflake is too long for a JavaScript number, and a file name has a dot in it), and saying plainly whether a named file can be served.
 */

interface FakeFile {
  backend: Backend;
  saves: string[];
}

const fakeFile = (
  initial: string,
  checkAttachment?: (name: string) => Promise<AttachmentStatus>
): FakeFile => {
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
      attachmentUrl: (name) => `api/attachments/${encodeURIComponent(name)}`,
      ...(checkAttachment === undefined ? {} : { checkAttachment })
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

interface Saved {
  context?: {
    users?: Record<string, { name: string }>;
    attachments?: Record<string, { path: string }>;
  };
}

const saved = (file: FakeFile): Saved =>
  JSON.parse(file.saves.at(-1) ?? `{}`) as Saved;

const snowflake = `1311000000000000201`;

const mentioning = json({
  messages: [
    {
      payload: {
        flags: 32768,
        components: [{ type: 10, content: `Over to <@${snowflake}>.` }]
      }
    }
  ]
});

/** The text of an entry's card, by the start of its heading. */
const textOf = (heading: string): string =>
  page
    .getByRole(`region`, {
      name: new RegExp(`^${heading.replace(/\./g, `\\.`)}`)
    })
    .element().textContent;

const preview = (): string =>
  document.querySelector(`[data-testid="preview-viewport"]`)?.textContent ?? ``;

describe(`the scene's surroundings`, () => {
  it(`defines a user from the note under the field that mentions them, in one action, keeping the snowflake exactly`, async () => {
    const file = fakeFile(mentioning);
    mount(file.backend);
    await vi.waitFor(() => expect(preview()).toContain(`@unknown-user`));
    await userEvent.click(page.getByRole(`row`, { name: /^Text Display/ }));
    // The note sits under the field the mention is in, with the action beside it.
    await userEvent.click(
      page.getByRole(`button`, { name: `Define user ${snowflake}` })
    );
    // The new entry is open and its name takes the cursor.
    const name = page
      .getByRole(`region`, { name: /\(no name\)/ })
      .getByRole(`textbox`, { name: `Name` });
    await expect.element(name).toHaveFocus();
    await userEvent.keyboard(`Mika`);
    await vi.waitFor(() =>
      expect(saved(file).context?.users).toStrictEqual({
        [snowflake]: { name: `Mika` }
      })
    );
    await vi.waitFor(() => expect(preview()).toContain(`@Mika`));
    // Where it is used, as a way back to the field.
    await expect
      .element(page.getByRole(`button`, { name: `Message › Text Display` }))
      .toBeVisible();
  });

  it(`lists what is used but not described in the findings too, with the same action`, async () => {
    mount(fakeFile(mentioning).backend);
    await userEvent.click(page.getByRole(`tab`, { name: /^Findings/ }));
    await expect
      .element(page.getByRole(`button`, { name: `Define user ${snowflake}` }))
      .toBeVisible();
  });

  it(`marks an entry nothing uses, and removes it without asking, since undo brings it back`, async () => {
    const file = fakeFile(
      json({
        messages: [{ author: `1`, payload: { content: `Hi` } }],
        context: { users: { "1": { name: `Inbou` }, "2": { name: `Old` } } }
      })
    );
    mount(file.backend);
    await userEvent.click(page.getByRole(`tab`, { name: /^Surroundings/ }));
    const old = page.getByRole(`region`, { name: /^Old/ });
    await expect.element(old).toBeVisible();
    expect(textOf(`Old`)).toMatch(/Unused\./);
    expect(textOf(`Inbou`)).toMatch(/Used by Message \(author\)/);
    expect(textOf(`Inbou`)).not.toMatch(/Unused\./);
    await userEvent.click(
      old.getByRole(`button`, { name: `Remove user 2` }).first()
    );
    await vi.waitFor(() =>
      expect(Object.keys(saved(file).context?.users ?? {})).toStrictEqual([`1`])
    );
  });

  it(`names a missing picture's file from its note, and says at once whether the studio command can serve it, and why not`, async () => {
    const file = fakeFile(
      json({
        messages: [
          {
            payload: {
              flags: 32768,
              components: [
                {
                  type: 12,
                  items: [
                    { media: { url: `attachment://chart.png` } },
                    { media: { url: `attachment://notes.png` } }
                  ]
                }
              ]
            }
          }
        ],
        context: { attachments: { "notes.png": { path: `notes.txt` } } }
      }),
      async (name) => {
        await Promise.resolve();
        return name === `chart.png`
          ? { served: true, type: `image/png`, bytes: 2048 }
          : {
              served: false,
              reason: `It points at /work/notes.txt, which does not have an image extension.`
            };
      }
    );
    mount(file.backend);
    await userEvent.click(page.getByRole(`tab`, { name: /^Surroundings/ }));
    await userEvent.click(
      page.getByRole(`button`, { name: `Name the file chart.png` })
    );
    await expect
      .element(
        page
          .getByRole(`region`, { name: `chart.png` })
          .getByRole(`textbox`, { name: `File on disk` })
      )
      .toHaveFocus();
    await userEvent.keyboard(`chart.png`);
    await vi.waitFor(() =>
      expect(saved(file).context?.attachments).toStrictEqual({
        "notes.png": { path: `notes.txt` },
        "chart.png": { path: `chart.png` }
      })
    );
    await vi.waitFor(() =>
      expect(textOf(`chart.png`)).toMatch(/Served as image\/png, 2(\.0)? kB/)
    );
    await vi.waitFor(() =>
      expect(textOf(`notes.png`)).toMatch(
        /Cannot be served\. It points at \/work\/notes\.txt, which does not have an image extension\./
      )
    );
  });

  it(`says plainly that a draft in the browser cannot check a file, rather than failing`, async () => {
    mount(
      fakeFile(
        json({
          messages: [{ payload: { content: `x` } }],
          context: { attachments: { "a.png": { path: `a.png` } } }
        })
      ).backend
    );
    await userEvent.click(page.getByRole(`tab`, { name: /^Surroundings/ }));
    await expect
      .element(page.getByRole(`region`, { name: `a.png` }))
      .toBeVisible();
    expect(textOf(`a.png`)).toMatch(/Not checked: this is a draft/);
  });

  it(`adds an entry by hand only with a real id, and says what one looks like`, async () => {
    const file = fakeFile(json({ messages: [{ payload: { content: `x` } }] }));
    mount(file.backend);
    await userEvent.click(page.getByRole(`tab`, { name: /^Surroundings/ }));
    const id = page.getByRole(`textbox`, { name: `New role's id` });
    await userEvent.type(id, `admins{Enter}`);
    await expect.element(page.getByText(/digits only/)).toBeVisible();
    await userEvent.clear(id);
    await userEvent.type(id, `42{Enter}`);
    await vi.waitFor(() =>
      expect(saved(file).context).toStrictEqual({
        roles: { "42": { name: `` } }
      })
    );
  });

  it(`asks a file holding a bare payload to become a scene first, since it has nowhere to keep surroundings`, async () => {
    mount(fakeFile(json({ content: `<@1>` })).backend);
    await userEvent.click(page.getByRole(`tab`, { name: /^Surroundings/ }));
    await expect
      .element(
        page
          .getByRole(`tabpanel`, { name: /^Surroundings/ })
          .getByRole(`button`, { name: `Convert to a scene…` })
      )
      .toBeVisible();
    await expect
      .element(page.getByRole(`button`, { name: /^Define user/ }))
      .not.toBeInTheDocument();
  });
});
