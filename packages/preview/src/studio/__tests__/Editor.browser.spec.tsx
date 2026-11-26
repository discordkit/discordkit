import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { describe, expect, it, onTestFinished, vi } from "vite-plus/test";
import { page, userEvent } from "vite-plus/test/browser";
import type { FileSnapshot, SaveResult } from "../../bridge/protocol.js";
import type { Backend } from "../backend/backend.js";
import "../global.css";
import { Studio } from "../Studio.js";

/**
 * The structured editor in a real browser, on a stand-in for the file bridge. These specs hold the tree and the forms to what a person building a message relies on: a change in a form reaches the file in the file's own shape, Discord's rules for a component are applied as the person edits it rather than reported after, findings appear on the field they are about, and a change from an agent is never overwritten by a form.
 */

interface FakeFile {
  backend: Backend;
  saves: string[];
  text: () => string;
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
    text: () => text,
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

/** A card as an agent writes it: snake_case, a bare payload, buttons one to a line. */
const card = `{
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "accent_color": 3099502,
      "components": [
        { "type": 10, "content": "## Question 4" },
        {
          "type": 1,
          "components": [
            { "type": 2, "style": 2, "label": "1", "custom_id": "vote:1" },
            { "type": 2, "style": 2, "label": "2", "custom_id": "vote:2" }
          ]
        }
      ]
    }
  ]
}
`;

const preview = (): HTMLElement => {
  const element = document.querySelector(`[data-testid="preview"]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No preview.`);
  return element;
};

const drawn = async (text: string): Promise<void> => {
  await vi.waitFor(() => expect(preview().textContent).toContain(text));
};

const row = (name: RegExp) => page.getByRole(`row`, { name });

const lastSave = (file: FakeFile): string => {
  const save = file.saves.at(-1);
  if (save === undefined) throw new Error(`Nothing was saved.`);
  return save;
};

describe(`the structured editor`, () => {
  it(`writes a text display's edit to the file in the file's own shape, changing only that line`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/Text Display Question 4/));
    const content = page.getByRole(`textbox`, { name: `Content` });
    await userEvent.fill(content, `## Question 5`);
    await drawn(`Question 5`);
    await vi.waitFor(() => expect(file.saves.length).toBeGreaterThan(0));
    const saved = lastSave(file);
    // snake_case stays snake_case, the file is not wrapped in a scene, and the one-line buttons stay on one line each.
    expect(saved).toBe(card.replace(`## Question 4`, `## Question 5`));
  });

  it(`shows an edit made in the JSON pane in the form, and an edit in the form in the JSON pane, so the two never disagree`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/Text Display Question 4/));
    await userEvent.fill(
      page.getByRole(`textbox`, { name: `Content` }),
      `## From the form`
    );
    await userEvent.click(page.getByRole(`tab`, { name: `JSON` }));
    const json = page.getByRole(`textbox`, { name: `Scene JSON` });
    await expect
      .element(json)
      .toHaveValue(card.replace(`## Question 4`, `## From the form`));
    await userEvent.fill(
      json,
      card.replace(`## Question 4`, `## From the JSON`)
    );
    await userEvent.click(page.getByRole(`tab`, { name: `Edit` }));
    await expect
      .element(page.getByRole(`textbox`, { name: `Content` }))
      .toHaveValue(`## From the JSON`);
  });

  it(`replaces a button's custom id with a URL when it becomes a Link, since Discord refuses a link button with a custom id`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/^Button 1/));
    await userEvent.click(page.getByRole(`button`, { name: /Style/ }));
    await userEvent.click(page.getByRole(`option`, { name: /^Link/ }));
    await userEvent.fill(
      page.getByRole(`textbox`, { name: `URL` }),
      `https://example.com`
    );
    await vi.waitFor(() =>
      expect(
        JSON.parse(lastSave(file)).components[0].components[1].components[0]
      ).toEqual({
        type: 2,
        style: 5,
        label: `1`,
        url: `https://example.com`
      })
    );
    await expect
      .element(page.getByRole(`textbox`, { name: `Custom id` }))
      .not.toBeInTheDocument();
  });

  it(`removes a cleared optional field's key rather than writing an empty string`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/^Button 2/));
    await userEvent.clear(page.getByRole(`textbox`, { name: `Label` }));
    await vi.waitFor(() => {
      const button = JSON.parse(lastSave(file)).components[0].components[1]
        .components[1];
      expect(button).toEqual({ type: 2, style: 2, custom_id: `vote:2` });
    });
  });

  it(`shows the duplicate custom id a duplicated button carries, on its field and in the tree, at once`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/^Button 2/));
    await userEvent.click(page.getByRole(`button`, { name: `Duplicate` }));
    // The copy is selected, and its custom id field says what is wrong with it.
    const field = page.getByRole(`textbox`, { name: `Custom id` });
    await expect.element(field).toHaveValue(`vote:2`);
    await expect
      .element(field)
      .toHaveAccessibleDescription(/already used by another component/);
    await expect.element(row(/^Button 2.*error/).first()).toBeInTheDocument();
  });

  it(`moves a component with Alt+Down, keeps it selected and focused, and writes the new order`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/Text Display Question 4/));
    await userEvent.keyboard(`{Alt>}{ArrowDown}{/Alt}`);
    await vi.waitFor(() =>
      expect(
        JSON.parse(lastSave(file)).components[0].components.map(
          (child: { type: number }) => child.type
        )
      ).toEqual([1, 10])
    );
    await expect
      .element(row(/Text Display Question 4/))
      .toHaveAttribute(`aria-selected`, `true`);
    expect(document.activeElement?.textContent).toContain(`Question 4`);
  });

  it(`selects what is clicked in the preview, in the tree and the form`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    const button = preview().querySelector(`button`);
    if (button === null) throw new Error(`No button drawn.`);
    await userEvent.click(button);
    await expect
      .element(row(/^Button 1/))
      .toHaveAttribute(`aria-selected`, `true`);
    await expect
      .element(page.getByRole(`textbox`, { name: `Custom id` }))
      .toHaveValue(`vote:1`);
  });

  it(`takes the accent colour as hex, stores the integer, and clears it by removing the key`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/^Container/));
    const hex = page.getByRole(`textbox`, { name: `Accent colour` });
    await expect.element(hex).toHaveValue(`#2F4B6E`);
    await userEvent.fill(hex, `#5865F2`);
    await userEvent.keyboard(`{Enter}`);
    await vi.waitFor(() =>
      expect(JSON.parse(lastSave(file)).components[0].accent_color).toBe(
        0x58_65_f2
      )
    );
    await userEvent.click(
      page.getByRole(`button`, { name: `Clear accent colour` })
    );
    await vi.waitFor(() =>
      expect(`accent_color` in JSON.parse(lastSave(file)).components[0]).toBe(
        false
      )
    );
  });

  it(`offers only what a container may hold, and focuses a new text display's content`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/^Container/));
    await userEvent.click(page.getByRole(`button`, { name: /^Add/ }));
    const inside = page
      .getByRole(`group`, { name: /Inside Container/ })
      .getByRole(`menuitem`);
    await expect.element(inside.first()).toBeVisible();
    // Exactly the renderer's list for a container: it cannot hold another container.
    expect(inside.elements().map((item) => item.textContent)).toEqual([
      `Text Display`,
      `Section`,
      `Separator`,
      `Media Gallery`,
      `File`,
      `Action Row`
    ]);
    await userEvent.click(
      page.getByRole(`menuitem`, { name: `Text Display` }).first()
    );
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(
        page.getByRole(`textbox`, { name: `Content` }).element()
      )
    );
    await userEvent.keyboard(`Added`);
    await drawn(`Added`);
  });

  it(`warns before switching a classic message to Components V2, saying what it removes`, async () => {
    const file = fakeFile(
      json({ content: `Hello`, embeds: [{ title: `An embed` }] })
    );
    mount(file.backend);
    await drawn(`Hello`);
    await userEvent.click(page.getByRole(`button`, { name: /^Classic/ }));
    await userEvent.click(page.getByRole(`option`, { name: `Components V2` }));
    const dialog = page.getByRole(`alertdialog`);
    await vi.waitFor(() => {
      const text = dialog.element().textContent;
      expect(text).toContain(`The message's text (5 characters)`);
      expect(text).toContain(`1 embed`);
    });
    await userEvent.click(
      page.getByRole(`button`, { name: `Keep it as it is` })
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(file.saves).toEqual([]);
    await userEvent.click(page.getByRole(`button`, { name: /^Classic/ }));
    await userEvent.click(page.getByRole(`option`, { name: `Components V2` }));
    await userEvent.click(
      page.getByRole(`button`, { name: `Switch and remove` })
    );
    await vi.waitFor(() =>
      expect(JSON.parse(lastSave(file))).toEqual({ flags: 32768 })
    );
  });

  it(`offers starting points on an empty scene, and writes the chosen one to the file`, async () => {
    const file = fakeFile(`{ "messages": [] }\n`);
    mount(file.backend);
    await userEvent.click(
      page.getByRole(`button`, { name: /Classic message with an embed/ })
    );
    await drawn(`Embed title`);
    await vi.waitFor(() =>
      expect(
        JSON.parse(lastSave(file)).messages[0].payload.embeds
      ).toHaveLength(1)
    );
  });

  it(`adds, reorders and removes a select's options, keeping each option's fields with it`, async () => {
    const select = json({
      flags: 32768,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: `level`,
              options: [{ label: `N5`, value: `n5` }]
            }
          ]
        }
      ]
    });
    const file = fakeFile(select);
    mount(file.backend);
    await vi.waitFor(() =>
      expect(row(/^String Select/).elements()).toHaveLength(1)
    );
    await userEvent.click(row(/^String Select/));
    await userEvent.click(page.getByRole(`button`, { name: `Add option` }));
    // The new option's first field takes the cursor.
    const second = page.getByRole(`region`, { name: `Option 2` });
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(
        second.getByRole(`textbox`, { name: `Label` }).element()
      )
    );
    await userEvent.keyboard(`{Control>}a{/Control}N4`);
    const options = (): unknown =>
      JSON.parse(lastSave(file)).components[0].components[0].options;
    await vi.waitFor(() =>
      expect(options()).toEqual([
        { label: `N5`, value: `n5` },
        { label: `N4`, value: `option` }
      ])
    );
    await userEvent.click(
      page.getByRole(`button`, { name: `Move Option 2 up` })
    );
    await vi.waitFor(() =>
      expect(options()).toEqual([
        { label: `N4`, value: `option` },
        { label: `N5`, value: `n5` }
      ])
    );
    // The fields moved with their option: the first option's label is now N4.
    await expect
      .element(
        page
          .getByRole(`region`, { name: `Option 1` })
          .getByRole(`textbox`, { name: `Label` })
      )
      .toHaveValue(`N4`);
    await userEvent.click(
      page.getByRole(`button`, { name: `Remove Option 1` })
    );
    await vi.waitFor(() =>
      expect(options()).toEqual([{ label: `N5`, value: `n5` }])
    );
  });

  it(`takes the person from a finding to its field`, async () => {
    const file = fakeFile(
      card.replace(`"label": "2", `, `"label": "${`x`.repeat(81)}", `)
    );
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(page.getByRole(`tab`, { name: /Findings/ }));
    await userEvent.click(
      page.getByRole(`button`, { name: /button-label-length/ })
    );
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(
        page.getByRole(`textbox`, { name: `Label` }).element()
      )
    );
    await expect
      .element(row(/^Button x+/))
      .toHaveAttribute(`aria-selected`, `true`);
  });

  it(`keeps a form edit and the agent's change apart when the file changes before the edit is saved`, async () => {
    const file = fakeFile(card);
    mount(file.backend);
    await drawn(`Question 4`);
    await userEvent.click(row(/Text Display Question 4/));
    await userEvent.fill(
      page.getByRole(`textbox`, { name: `Content` }),
      `## Mine`
    );
    // Before the debounced save goes out, the agent writes.
    file.change(card.replace(`Question 4`, `The agent's`));
    await expect
      .element(
        page
          .getByRole(`alert`)
          .getByText(/changed on disk while you had unsaved edits/)
      )
      .toBeVisible();
    await drawn(`The agent's`);
    // The forms show the file and are paused, so a further edit cannot overwrite either version.
    await expect
      .element(page.getByRole(`textbox`, { name: `Content` }))
      .toBeDisabled();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(file.saves).toEqual([]);
    // The person's version is kept, as JSON, until they choose.
    await userEvent.click(page.getByRole(`tab`, { name: `JSON` }));
    await expect
      .element(page.getByRole(`textbox`, { name: `Scene JSON` }))
      .toHaveValue(card.replace(`## Question 4`, `## Mine`));
    await userEvent.click(
      page.getByRole(`button`, { name: /Overwrite the file/ })
    );
    await vi.waitFor(() =>
      expect(file.text()).toBe(card.replace(`## Question 4`, `## Mine`))
    );
  });
});
