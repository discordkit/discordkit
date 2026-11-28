import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "playwright";
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
      const editor = page.getByRole(`textbox`, { name: `Scene JSON` });
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
      const editor = page.getByRole(`textbox`, { name: `Scene JSON` });
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
      const editor = page.getByRole(`textbox`, { name: `Scene JSON` });
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
