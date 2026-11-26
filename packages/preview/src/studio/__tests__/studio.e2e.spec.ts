import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Locator, type Page } from "playwright";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from "vite-plus/test";

/**
 * The whole loop Studio exists for, end to end: the real `discordkit-preview studio` command serving the built app on a real file, a real browser, an agent's edit to the file showing up in the preview, and a person's edit in the browser reaching the file. It runs the package's dist, so build first (`vp run build` in packages/preview).
 */
const packageRoot = new URL(`../../../`, import.meta.url);
const bin = fileURLToPath(new URL(`bin/discordkit-preview.mjs`, packageRoot));
const builtApp = new URL(`dist/studio/index.html`, packageRoot);

// Launching a browser and the command is the slow part, and on a cold two-core CI runner it has taken longer than Vitest's default hook limit.
const launchTimeout = 60_000;
const flowTimeout = 30_000;

const payload = (content: string): string =>
  `${JSON.stringify(
    {
      flags: 32768,
      components: [
        { type: 17, accent_color: 3099502, components: [{ type: 10, content }] }
      ]
    },
    null,
    2
  )}\n`;

interface Running {
  child: ChildProcess;
  url: string;
}

/** Starts the command as an agent would, and waits for the one JSON document it prints when ready. */
const startStudio = async (file: string): Promise<Running> =>
  new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [bin, `studio`, file, `--json`, `--no-open`, `--port`, `0`],
      { stdio: [`ignore`, `pipe`, `pipe`] }
    );
    let stdout = ``;
    let stderr = ``;
    child.stderr?.setEncoding(`utf8`).on(`data`, (chunk: string) => {
      stderr += chunk;
    });
    child.stdout?.setEncoding(`utf8`).on(`data`, (chunk: string) => {
      stdout += chunk;
      try {
        const ready: unknown = JSON.parse(stdout);
        if (typeof ready === `object` && ready !== null && `url` in ready) {
          resolve({ child, url: String(ready.url) });
        }
      } catch {
        // Not the whole document yet.
      }
    });
    child.on(`exit`, (code) =>
      reject(
        new Error(
          `discordkit-preview studio exited with ${String(code)} before it was ready: ${stderr}`
        )
      )
    );
  });

const previewText = async (page: Page): Promise<string> =>
  page.getByTestId(`preview`).innerText();

/** The JSON pane's text area. Studio opens on its Edit tab, so the JSON tab is opened first. */
const jsonPane = async (page: Page): Promise<Locator> => {
  await page.getByRole(`tab`, { name: `JSON` }).click();
  return page.getByRole(`textbox`, { name: `Scene JSON` });
};

describe(`discordkit-preview studio`, () => {
  let browser: Browser;
  let dir: string;
  let file: string;
  let studio: Running;
  let page: Page;

  beforeAll(async () => {
    if (!existsSync(builtApp)) {
      throw new Error(
        `Studio's built app is missing at ${fileURLToPath(builtApp)}. This spec runs the command the package ships, from its dist. Run \`vp run build\` in packages/preview, then run the tests again.`
      );
    }
    browser = await chromium.launch(
      process.env.CI ? { channel: `chrome` } : {}
    );
  }, launchTimeout);

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), `discordkit-preview-studio-`));
    file = join(dir, `card.json`);
    await writeFile(file, payload(`Written by the agent`));
    studio = await startStudio(file);
    page = await browser.newPage();
    await page.goto(studio.url);
    await page
      .getByTestId(`preview`)
      .getByText(`Written by the agent`)
      .waitFor({ timeout: flowTimeout });
    return async () => {
      await page.close();
      studio.child.kill();
      await rm(dir, { recursive: true, force: true });
    };
  }, launchTimeout);

  afterAll(async () => {
    await browser.close();
  });

  it(
    `shows a change made to the file on disk, within a second, without a reload`,
    async () => {
      // A reload would lose this.
      await page.evaluate(() => {
        Object.assign(window, { __studioMarker: true });
      });
      const start = Date.now();
      await writeFile(file, payload(`Changed on disk`));
      await expect
        .poll(async () => previewText(page), { timeout: 5000, interval: 50 })
        .toContain(`Changed on disk`);
      expect(Date.now() - start).toBeLessThan(1000);
      await expect(
        page.evaluate(() => `__studioMarker` in window)
      ).resolves.toBe(true);
    },
    flowTimeout
  );

  it(
    `writes an edit made in the JSON pane to the file, once it parses`,
    async () => {
      const editor = await jsonPane(page);
      await editor.fill(payload(`Edited in Studio`));
      await expect
        .poll(async () => readFile(file, `utf8`), { timeout: 5000 })
        .toBe(payload(`Edited in Studio`));
      await expect(previewText(page)).resolves.toContain(`Edited in Studio`);
    },
    flowTimeout
  );

  it(
    `never writes text that does not parse, and keeps the last good preview`,
    async () => {
      const editor = await jsonPane(page);
      await editor.fill(`{ "flags": 32768, "components": [`);
      await expect
        .poll(async () => page.getByText(/Line 1, column \d+:/).isVisible())
        .toBe(true);
      await page.waitForTimeout(600);
      await expect(readFile(file, `utf8`)).resolves.toBe(
        payload(`Written by the agent`)
      );
      await expect(previewText(page)).resolves.toContain(
        `Written by the agent`
      );
    },
    flowTimeout
  );

  it(
    `keeps the person's unsaved text when the agent changes the file, and does not overwrite the agent's change`,
    async () => {
      const editor = await jsonPane(page);
      await editor.fill(`{ "half typed": `);
      await writeFile(file, payload(`The agent's newer change`));
      await expect
        .poll(async () =>
          page
            .getByText(/changed on disk while you had unsaved edits/)
            .isVisible()
        )
        .toBe(true);
      await expect(editor.inputValue()).resolves.toBe(`{ "half typed": `);
      await expect
        .poll(async () => previewText(page))
        .toContain(`The agent's newer change`);
      await page.waitForTimeout(600);
      await expect(readFile(file, `utf8`)).resolves.toBe(
        payload(`The agent's newer change`)
      );
    },
    flowTimeout
  );
});

/** Runs the command once to completion, as an agent would, and gives back its exit code and output. */
const runCommand = async (
  args: readonly string[]
): Promise<{ code: number | null; stdout: string; stderr: string }> =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [bin, ...args], {
      stdio: [`ignore`, `pipe`, `pipe`]
    });
    let stdout = ``;
    let stderr = ``;
    child.stdout?.setEncoding(`utf8`).on(`data`, (chunk: string) => {
      stdout += chunk;
    });
    child.stderr?.setEncoding(`utf8`).on(`data`, (chunk: string) => {
      stderr += chunk;
    });
    child.on(`exit`, (code) => resolve({ code, stdout, stderr }));
  });

const fixture = fileURLToPath(
  new URL(`../../__tests__/wire/inbou-question.json`, import.meta.url)
);

/** Selects a row of the component tree by its accessible name. */
const pick = async (page: Page, name: RegExp): Promise<void> => {
  await page.getByRole(`row`, { name }).last().click();
};

/** Opens the add menu on the selected row and adds a component, inside it or after it. */
const add = async (page: Page, type: string, where: RegExp): Promise<void> => {
  await page.getByRole(`button`, { name: /^Add/ }).click();
  await page
    .getByRole(`group`, { name: where })
    .getByRole(`menuitem`, { name: type, exact: true })
    .click();
};

const textDisplay = async (page: Page, content: string): Promise<void> => {
  await add(page, `Text Display`, /^After it/);
  await page.getByRole(`textbox`, { name: `Content` }).fill(content);
};

const button = async (
  page: Page,
  where: RegExp,
  label: string,
  customId: string
): Promise<void> => {
  await add(page, `Button`, where);
  await page.getByRole(`textbox`, { name: `Label` }).fill(label);
  await page.getByRole(`textbox`, { name: `Custom id` }).fill(customId);
};

describe(`discordkit-preview studio, editing with the tree and the forms`, () => {
  let browser: Browser;
  let dir: string;
  let file: string;
  let studio: Running;
  let page: Page;

  beforeAll(async () => {
    if (!existsSync(builtApp)) {
      throw new Error(
        `Studio's built app is missing at ${fileURLToPath(builtApp)}. Run \`vp run build\` in packages/preview, then run the tests again.`
      );
    }
    browser = await chromium.launch(
      process.env.CI ? { channel: `chrome` } : {}
    );
  }, launchTimeout);

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), `discordkit-preview-studio-`));
    file = join(dir, `card.json`);
    return async () => {
      await page.close();
      studio.child.kill();
      await rm(dir, { recursive: true, force: true });
    };
  });

  afterAll(async () => {
    await browser.close();
  });

  const open = async (text: string): Promise<void> => {
    await writeFile(file, text);
    studio = await startStudio(file);
    page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(studio.url);
  };

  it(`builds Inbou's question card from an empty scene with only the tree and the forms, and the file draws exactly as the fixture does`, async () => {
    await open(`{ "messages": [] }\n`);
    await page
      .getByRole(`button`, { name: /Empty Components V2 message/ })
      .click();
    await pick(page, /^Message/);

    // The card: a container with the indigo accent.
    await add(page, `Container`, /^Inside Message/);
    const accent = page.getByRole(`textbox`, { name: `Accent colour` });
    await accent.fill(`#2F4B6E`);
    await accent.press(`Enter`);

    await add(page, `Text Display`, /^Inside Container/);
    await page
      .getByRole(`textbox`, { name: `Content` })
      .fill(`**もんだい4** · 18 / 24 · ends <t:1795604745:R> · 3 answered`);
    await textDisplay(
      page,
      `-# ＿＿の ぶんと だいたい おなじ いみの ぶんが あります。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。`
    );
    await textDisplay(
      page,
      `## __兄は 先生です。__\n-# 兄 あに · 先生 せんせい`
    );
    // A separator's defaults are Discord's: a divider, small spacing.
    await add(page, `Separator`, /^After it/);
    await textDisplay(
      page,
      [
        `### 1　兄は がっこうで おしえて います。`,
        `### 2　兄は びょういんで はたらいて います。`,
        `### 3　兄は がっこうで べんきょうして います。`,
        `### 4　兄は みせで やさいを うって います。`,
        `-# 兄 あに`
      ].join(`\n`)
    );

    // The four answer buttons in a row of their own inside the card.
    await add(page, `Action Row`, /^After it/);
    await button(page, /^Inside Action Row/, `1`, `vote:1`);
    for (const label of [`2`, `3`, `4`]) {
      await button(page, /^After it/, label, `vote:${label}`);
    }

    // The red "End test" button, in a row under the card.
    await pick(page, /^Message/);
    await add(page, `Action Row`, /^Inside Message/);
    await button(page, /^Inside Action Row/, `End test`, `exam:end`);
    await page.getByRole(`button`, { name: /Style/ }).click();
    await page.getByRole(`option`, { name: /^Danger/ }).click();

    // The file holds what was built, and nothing Studio does not write.
    await expect
      .poll(
        async () =>
          (
            JSON.parse(await readFile(file, `utf8`)) as {
              messages: { payload: { components: unknown[] } }[];
            }
          ).messages[0].payload.components.length,
        { timeout: 5000 }
      )
      .toBe(2);
    await page.waitForTimeout(600);
    const saved = JSON.parse(await readFile(file, `utf8`)) as {
      messages: { payload: unknown }[];
    };
    expect(saved.messages).toHaveLength(1);
    expect(Object.keys(saved)).toEqual([`messages`]);

    // The acceptance test: the saved file and the fixture render to the same picture.
    const out = join(dir, `out`);
    const fixtureCopy = join(dir, `fixture.json`);
    await writeFile(fixtureCopy, await readFile(fixture, `utf8`));
    // CI drives the Chrome its runner image ships, as the other specs do; without this the command exits 2 there, having no Playwright Chromium to launch.
    const render = await runCommand([
      `render`,
      fixtureCopy,
      file,
      `--out-dir`,
      out,
      `--json`,
      ...(process.env.CI ? [`--channel`, `chrome`] : [])
    ]);
    expect(render).toMatchObject({ code: 0 });
    const diff = await runCommand([
      `diff`,
      join(out, `fixture.png`),
      join(out, `card.png`),
      `--out`,
      join(out, `diff.png`),
      `--json`
    ]);
    expect(diff).toMatchObject({ code: 0 });
  }, 180_000);

  it(
    `keeps a form edit and the agent's change apart when the file changes before the edit is saved`,
    async () => {
      await open(payload(`Written by the agent`));
      await page
        .getByTestId(`preview`)
        .getByText(`Written by the agent`)
        .waitFor({ timeout: flowTimeout });
      await pick(page, /^Text Display/);
      await page
        .getByRole(`textbox`, { name: `Content` })
        .fill(`Typed in a form`);
      // The agent writes before the form's edit is saved (saves wait for a 250ms pause in typing).
      await writeFile(file, payload(`The agent's newer change`));
      await page
        .getByRole(`alert`)
        .getByText(/changed on disk while you had unsaved edits/)
        .waitFor({ timeout: flowTimeout });
      await expect
        .poll(async () => previewText(page))
        .toContain(`The agent's newer change`);
      // The forms show the file's version and are paused.
      await expect(
        page.getByRole(`textbox`, { name: `Content` }).isDisabled()
      ).resolves.toBe(true);
      await page.waitForTimeout(600);
      await expect(readFile(file, `utf8`)).resolves.toBe(
        payload(`The agent's newer change`)
      );
      // The person's version is kept until they choose; choosing theirs writes it.
      await expect((await jsonPane(page)).inputValue()).resolves.toContain(
        `Typed in a form`
      );
      await page.getByRole(`button`, { name: /Overwrite the file/ }).click();
      await expect
        .poll(async () => readFile(file, `utf8`), { timeout: 5000 })
        .toBe(payload(`Typed in a form`));
    },
    flowTimeout
  );
});
