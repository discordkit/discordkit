import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type * as Playwright from "playwright";
import type { Browser } from "playwright";
import { isObject } from "@discordkit/core/utils/isObject";
import type { RenderInputOptions } from "../node/render.js";
import type { RenderRequest, RenderStatus } from "./protocol.js";

/**
 * Draws the scene file to a PNG for Studio's export, with the same `render` the command line runs, so the image is the one `discordkit-preview render` writes for the same file and options.
 *
 * It is reached through the bridge, so it is bounded: one drawing at a time, a limit on how many a minute, and a time limit on each, after which the browser is closed so nothing keeps running. One browser is launched on the first export and reused after, since the launch is most of a render's cost; it is closed with the server. Nothing is written anywhere but the renderer's own asset cache, as `render` writes it; the image is returned, not saved.
 */

/** Why an export did not happen, with the HTTP status the bridge answers with. */
export class ExportError extends Error {
  override name = `ExportError`;
  readonly status: number;
  readonly retryAfter: number | undefined;
  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

/** Draws one scene file's text, with the options the request carried, into PNG bytes. Tests pass their own. */
export type DrawPng = (
  input: unknown,
  options: RenderInputOptions,
  browser: Browser
) => Promise<Buffer>;

export interface ExporterOptions {
  /** The installed browser to drive (`chrome`, `msedge`), as `render --channel` takes it. */
  channel?: string;
  /** What attachment paths are resolved against, as the bridge serves them. */
  cwd: string;
  /** How long one drawing may take. */
  timeoutMs?: number;
  /** How many drawings may start in a minute. */
  perMinute?: number;
  /** Launches the browser. Tests pass their own. */
  launch?: () => Promise<Browser>;
  draw?: DrawPng;
}

export interface Exporter {
  status: () => Promise<RenderStatus>;
  draw: (text: string, request: RenderRequest) => Promise<Buffer>;
  close: () => Promise<void>;
}

const reasonOf = (error: unknown): string =>
  error instanceof Error ? (error.message.split(`\n`)[0] ?? ``) : String(error);

const loadPlaywright = async (): Promise<typeof Playwright> => {
  try {
    return await import(`playwright`);
  } catch (error) {
    throw new ExportError(
      503,
      `This machine cannot draw a PNG: \`playwright\`, which the renderer uses to drive a headless browser, is not installed (${reasonOf(error)}). Install it beside @discordkit/preview (\`npm install --save-dev playwright\`, then \`npx playwright install chromium\`) and restart the studio command. Everything else in Studio works without it.`
    );
  }
};

const defaultDraw: DrawPng = async (input, options, browser) => {
  // Loaded on the first export only, so starting Studio never loads the renderer.
  const { render } = await import(`../node/render.js`);
  const result = await render(input, { ...options, browser });
  if (result.image === undefined) {
    const reasons = result.findings
      .filter((finding) => finding.severity === `error`)
      .map((finding) => finding.message);
    throw new ExportError(
      422,
      `The scene was not drawn, so there is no PNG. ${reasons.join(` `) || `The renderer gave no reason.`} Fix what the findings name, then export again.`
    );
  }
  return result.image.png;
};

/** The scene's attachment paths resolved against `cwd`, so the export reads the same files the bridge serves, wherever the command was started. */
const withAttachmentsFrom = (input: unknown, cwd: string): unknown => {
  if (!isObject(input) || !isObject(input.context)) return input;
  const { attachments } = input.context;
  if (!isObject(attachments)) return input;
  const resolved = Object.fromEntries(
    Object.entries(attachments).map(([name, entry]) => [
      name,
      isObject(entry) && typeof entry.path === `string`
        ? { ...entry, path: resolve(cwd, entry.path) }
        : entry
    ])
  );
  return { ...input, context: { ...input.context, attachments: resolved } };
};

export const createExporter = ({
  channel,
  cwd,
  timeoutMs = 60_000,
  perMinute = 20,
  launch,
  draw = defaultDraw
}: ExporterOptions): Exporter => {
  let browser: Promise<Browser> | undefined;
  let busy = false;
  let closed = false;
  const started: number[] = [];

  /** Why the last launch failed, which the status then reports, until a launch succeeds. */
  let unavailable: string | undefined;

  const launchBrowser = async (): Promise<Browser> => {
    try {
      const launched =
        launch === undefined
          ? await (
              await loadPlaywright()
            ).chromium.launch(channel === undefined ? {} : { channel })
          : await launch();
      unavailable = undefined;
      return launched;
    } catch (error) {
      if (error instanceof ExportError) {
        unavailable = error.message;
        throw error;
      }
      unavailable =
        channel === undefined
          ? `This machine cannot draw a PNG: Playwright's Chromium could not be launched (${reasonOf(error)}). Usually it has not been downloaded: run \`npx playwright install chromium\`, or restart the studio command with \`--channel chrome\` to use an installed Google Chrome.`
          : `This machine cannot draw a PNG: the browser for \`--channel ${channel}\` could not be launched (${reasonOf(error)}). Install it, or restart the studio command with another channel, or without \`--channel\` to use Playwright's Chromium.`;
      throw new ExportError(503, unavailable);
    }
  };

  /** The shared browser, launched on first use and again if it has closed or crashed. */
  const shared = async (): Promise<Browser> => {
    if (browser !== undefined) {
      const current = await browser.catch(() => undefined);
      if (current?.isConnected() === true) return current;
    }
    browser = launchBrowser();
    try {
      return await browser;
    } catch (error) {
      browser = undefined;
      throw error;
    }
  };

  const closeBrowser = async (): Promise<void> => {
    const current = await browser?.catch(() => undefined);
    browser = undefined;
    await current?.close().catch(() => undefined);
  };

  return {
    status: async () => {
      if (unavailable !== undefined) {
        return { available: false, reason: unavailable };
      }
      if (launch !== undefined) return { available: true };
      try {
        const playwright = await loadPlaywright();
        // Without a channel, Playwright's own Chromium must have been downloaded; with one, only a launch can tell.
        if (
          channel === undefined &&
          !existsSync(playwright.chromium.executablePath())
        ) {
          return {
            available: false,
            reason: `This machine cannot draw a PNG yet: Playwright's Chromium has not been downloaded. Run \`npx playwright install chromium\`, or restart the studio command with \`--channel chrome\` to use an installed Google Chrome.`
          };
        }
        return { available: true };
      } catch (error) {
        return { available: false, reason: reasonOf(error) };
      }
    },
    draw: async (text, request) => {
      if (closed) {
        throw new ExportError(503, `The studio command is stopping.`);
      }
      if (busy) {
        throw new ExportError(
          429,
          `A PNG is being drawn already. Studio draws one at a time; wait for it to finish, then export again.`,
          2
        );
      }
      const now = Date.now();
      while (started.length > 0 && now - (started[0] ?? now) > 60_000) {
        started.shift();
      }
      if (started.length >= perMinute) {
        const wait = Math.ceil((60_000 - (now - (started[0] ?? now))) / 1000);
        throw new ExportError(
          429,
          `${String(perMinute)} PNGs have been drawn in the last minute, which is as many as Studio draws in one. Wait ${String(wait)} seconds, then export again.`,
          wait
        );
      }
      busy = true;
      started.push(now);
      const input: unknown = JSON.parse(text);
      const { baseVersion: _, ...options } = request;
      const outcome = await new Promise<
        { drawn: true; png: Buffer } | { drawn: false; error: unknown }
      >((resolve) => {
        // Whichever comes first, the drawing or the time limit, settles it; the other is ignored.
        const settle = resolve;
        const timer = setTimeout(() => {
          // Closing the browser ends the drawing, so nothing keeps running after the person was told it stopped.
          void closeBrowser();
          settle({
            drawn: false,
            error: new ExportError(
              504,
              `Drawing the PNG took longer than ${String(timeoutMs / 1000)} seconds, so it was stopped. A scene usually draws in a second or two; an image that will not download is the likely cause. Check the findings for one, then export again.`
            )
          });
        }, timeoutMs);
        const work = async (): Promise<void> => {
          try {
            const target = await shared();
            const png = await draw(
              withAttachmentsFrom(input, cwd),
              options,
              target
            );
            settle({ drawn: true, png });
          } catch (error) {
            settle({ drawn: false, error });
          } finally {
            clearTimeout(timer);
            // The slot is free once the drawing has really stopped, not when the person stopped waiting for it.
            busy = false;
          }
        };
        void work();
      });
      if (outcome.drawn) return outcome.png;
      throw outcome.error instanceof Error
        ? outcome.error
        : new Error(String(outcome.error));
    },
    close: async () => {
      closed = true;
      await closeBrowser();
    }
  };
};
