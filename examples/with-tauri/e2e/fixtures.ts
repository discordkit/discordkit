import {
  test as base,
  expect,
  chromium,
  type Page,
  type Browser
} from "@playwright/test";

/**
 * Test fixtures for the Tauri smoke suite. They attach over CDP to the webview of an app launched separately via `vp run start:cdp` (there's no Playwright launcher for a Tauri shell), and expose a small set of helpers over the app's `data-testid`s so each spec reads as a flow, not DOM plumbing.
 */

const CDP_ENDPOINT = process.env.CDP_ENDPOINT ?? `http://127.0.0.1:9222`;

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Attach to the running app over CDP. WebView2 intermittently exposes a
 * `shared_worker` target that Playwright's `connectOverCDP` throws on while
 * enumerating targets at connect time; since the worker is transient, a short
 * retry rides it out and lands in a clean window.
 */
const attach = async (): Promise<Browser> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await chromium.connectOverCDP(CDP_ENDPOINT);
    } catch (error) {
      lastError = error;
      await sleep(500);
    }
  }
  throw new Error(
    `Couldn't attach to the app over CDP at ${CDP_ENDPOINT}. Launch it first ` +
      `with \`vp run start:cdp\` (Windows; WebView2 must expose the debugging ` +
      `port). Original error: ${String(lastError)}`
  );
};

/** Whether interactive flows (needing a human to approve/decline) should run. */
export const INTERACTIVE = process.env.DISCORD_INTERACTIVE === `1`;

/** The connection-status pill's text — `starting…` / `connecting…` / `ready` / `disconnected` / `logging out…`. */
const statusLabel = async (page: Page): Promise<string> => {
  const text = await page.getByTestId(`connection-status`).textContent();
  return (text ?? ``).trim();
};

/** The friends-list panel's full text (for asserting on prompts / error copy). */
const listText = async (page: Page): Promise<string> => {
  const text = await page.getByTestId(`friends-list`).innerText();
  return text.replace(/\s+/g, ` `).trim();
};

/** Count of rendered section headers (a populated friends list has ≥1). */
const sectionCount = async (page: Page): Promise<number> =>
  page.locator(`[data-testid='friends-list'] > div > div > button`).count();

/** Whether a loading skeleton is currently showing. */
const skeletonShown = async (page: Page): Promise<boolean> =>
  (await page.locator(`[data-testid='friends-list'] [role='status']`).count()) >
  0;

/** Poll the status pill until it equals `target`, or throw after `timeout` ms. */
const waitForStatus = async (
  page: Page,
  target: string,
  timeout = 30_000
): Promise<void> => {
  await expect
    .poll(async () => statusLabel(page), { timeout, intervals: [500] })
    .toBe(target);
};

/** The helpers handed to each test. */
export interface Studio {
  page: Page;
  status: () => Promise<string>;
  listText: () => Promise<string>;
  sectionCount: () => Promise<number>;
  waitForStatus: (target: string, timeout?: number) => Promise<void>;
  clickConnect: () => Promise<void>;
  clickLogout: () => Promise<void>;
  /** Whether a loading skeleton is currently showing. */
  hasSkeleton: () => Promise<boolean>;
  /** Print an action for the human to perform before the assertion proceeds. */
  prompt: (action: string) => void;
}

export const test = base.extend<{ studio: Studio }, { cdpPage: Page }>({
  // Worker-scoped: attach over CDP ONCE per worker and reuse the page across all
  // tests. Reconnecting per-test spawns stray `about:blank` webview windows and
  // trips Playwright's target enumeration on WebView2's shared worker, so we
  // connect once (matching the canonical Tauri+WebView2 CDP setup) and detach at
  // worker teardown without closing the app.
  cdpPage: [
    // Playwright parses the first arg for fixture DI, so it must be an object
    // pattern; we depend on no other fixtures, hence the empty destructure.
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      const browser = await attach();
      // Pick the real app page (origin 127.0.0.1), not a stray `about:blank`
      // webview the connection may have left behind.
      const pages = browser.contexts().flatMap((context) => context.pages());
      const page =
        pages.find((candidate) => candidate.url().includes(`127.0.0.1`)) ??
        pages.at(0);
      if (!page) {
        throw new Error(
          `No app page over CDP — is the app running (vp run start:cdp)?`
        );
      }
      await page.waitForLoadState(`domcontentloaded`);
      await use(page);
      await browser.close().catch(() => undefined);
    },
    { scope: `worker` }
  ],

  studio: async ({ cdpPage: page }, use) => {
    const studio: Studio = {
      page,
      status: async () => statusLabel(page),
      listText: async () => listText(page),
      sectionCount: async () => sectionCount(page),
      waitForStatus: async (target, timeout) =>
        waitForStatus(page, target, timeout),
      clickConnect: async () => page.getByTestId(`connect-discord`).click(),
      clickLogout: async () => page.getByTestId(`logout`).click(),
      hasSkeleton: async () => skeletonShown(page),
      prompt: (action) => {
        // eslint-disable-next-line no-console
        console.log(`\n  >>> ACTION REQUIRED: ${action} <<<\n`);
      }
    };
    await use(studio);
  }
});

export { expect };
