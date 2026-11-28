import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Browser } from "playwright";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import type { RenderInputOptions } from "../../node/render.js";
import type { ExporterOptions } from "../exporter.js";
import type * as Bridge from "../server.js";
import { startStudioServer, type StudioServer } from "../server.js";

/**
 * Studio's PNG export draws the scene file with the Node renderer, through the bridge. The bridge is a local server any web page can make a browser send requests to, and drawing launches a browser, so these specs hold the export to every rule the other routes follow (the secret, its own Host and Origin, one file, versioned requests) and to its own bounds: it draws only the version the person is looking at, one at a time, a limited number a minute, each for a limited time, writes nothing, and reuses one browser.
 */

interface Reply {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
}

const send = async (
  url: string,
  {
    method = `GET`,
    headers = {},
    body
  }: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<Reply> =>
  new Promise((resolve, reject) => {
    const req = httpRequest(url, { method, headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on(`data`, (chunk: Buffer) => chunks.push(chunk));
      res.on(`end`, () =>
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: Buffer.concat(chunks)
        })
      );
    });
    req.on(`error`, reject);
    req.end(body);
  });

const sha = (text: string): string =>
  createHash(`sha256`).update(Buffer.from(text, `utf8`)).digest(`hex`);

const sceneText = `${JSON.stringify({
  messages: [{ payload: { content: `Hello` } }],
  context: { attachments: { "card.png": { path: `images/card.png` } } }
})}\n`;

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

interface FakeBrowsers {
  launched: number;
  closed: number;
  launch: () => Promise<Browser>;
}

/** A stand-in for Playwright's browser: launching and closing are counted, and a drawing in progress is ended by closing it, as a real one is. */
const fakeBrowsers = (): FakeBrowsers & { onClose: Set<() => void> } => {
  const onClose = new Set<() => void>();
  const browsers: FakeBrowsers & { onClose: Set<() => void> } = {
    launched: 0,
    closed: 0,
    onClose,
    launch: async () => {
      await Promise.resolve();
      browsers.launched++;
      let connected = true;
      const browser: Pick<Browser, `isConnected` | `close`> = {
        isConnected: () => connected,
        close: async () => {
          await Promise.resolve();
          connected = false;
          browsers.closed++;
          for (const listener of onClose) listener();
        }
      };
      // Only what the exporter calls is stood in for.
      return browser as Browser;
    }
  };
  return browsers;
};

describe(`the bridge's PNG export`, () => {
  let dir: string;
  let file: string;
  let staticDir: string;
  let server: StudioServer;
  let browsers: ReturnType<typeof fakeBrowsers>;
  let drawn: { input: unknown; options: RenderInputOptions }[];

  const start = async (
    exporter: Omit<ExporterOptions, `channel` | `cwd`> = {}
  ): Promise<void> => {
    await server.close();
    server = await startStudioServer({
      file,
      staticDir,
      port: 0,
      cwd: dir,
      exporter: {
        launch: browsers.launch,
        draw: async (input, options) => {
          drawn.push({ input, options });
          await new Promise((resolve) => setTimeout(resolve, 30));
          return png;
        },
        ...exporter
      }
    });
  };

  const exportPng = async (
    body: unknown = { baseVersion: sha(sceneText) },
    headers: Record<string, string> = {}
  ): Promise<Reply> =>
    send(`${server.url}api/render`, {
      method: `POST`,
      headers: { "Content-Type": `application/json`, ...headers },
      body: typeof body === `string` ? body : JSON.stringify(body)
    });

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), `discordkit-preview-export-`));
    file = join(dir, `card.json`);
    staticDir = join(dir, `studio`);
    await mkdir(staticDir);
    await writeFile(
      join(staticDir, `index.html`),
      `<html><head></head></html>`
    );
    await writeFile(file, sceneText);
    browsers = fakeBrowsers();
    drawn = [];
    server = await startStudioServer({ file, staticDir, port: 0, cwd: dir });
    await start();
  });

  afterEach(async () => {
    await server.close();
    await rm(dir, { recursive: true, force: true });
  });

  it(`draws the file as it is on disk and returns the PNG, writing nothing`, async () => {
    const before = await readdir(dir, { recursive: true });
    const reply = await exportPng({
      baseVersion: sha(sceneText),
      viewports: [{ device: `iphone-14-pro` }],
      theme: `light`
    });
    expect(reply.status).toBe(200);
    expect(reply.headers[`content-type`]).toBe(`image/png`);
    expect(reply.headers[`content-disposition`]).toBe(
      `attachment; filename*=UTF-8''card.png`
    );
    expect(reply.body.equals(png)).toBe(true);
    // The file's own text, with the request's settings as the command line's options.
    expect(drawn).toHaveLength(1);
    expect(drawn[0].options).toStrictEqual({
      viewports: [{ device: `iphone-14-pro` }],
      theme: `light`
    });
    // Attachments are read from where the bridge serves them.
    expect(drawn[0].input).toMatchObject({
      context: {
        attachments: { "card.png": { path: join(dir, `images`, `card.png`) } }
      }
    });
    await expect(readFile(file, `utf8`)).resolves.toBe(sceneText);
    await expect(readdir(dir, { recursive: true })).resolves.toEqual(before);
  });

  it(`reuses one browser across exports, and closes it with the server`, async () => {
    expect((await exportPng()).status).toBe(200);
    expect((await exportPng()).status).toBe(200);
    expect(browsers.launched).toBe(1);
    await server.close();
    expect(browsers.closed).toBe(1);
    // Restarted for the next spec's cleanup.
    await start();
  });

  it(`refuses to draw a version the person has not seen, so the PNG is always of what Studio showed`, async () => {
    await writeFile(file, `{"messages":[{"payload":{"content":"Agent"}}]}`);
    const reply = await exportPng();
    expect(reply.status).toBe(409);
    expect(reply.body.toString()).toMatch(/changed on disk since/);
    expect(drawn).toHaveLength(0);
  });

  it(`draws one at a time, and no more than its limit a minute, saying when to try again`, async () => {
    await start({ perMinute: 2 });
    const [first, second] = await Promise.all([exportPng(), exportPng()]);
    expect([first.status, second.status].sort((a, b) => a - b)).toEqual([
      200, 429
    ]);
    expect((await exportPng()).status).toBe(200);
    const third = await exportPng();
    expect(third.status).toBe(429);
    expect(Number(third.headers[`retry-after`])).toBeGreaterThan(0);
    expect(drawn).toHaveLength(2);
  });

  it(`stops a drawing that runs too long by closing its browser, says so, and draws again after`, async () => {
    let hang = true;
    await start({
      timeoutMs: 150,
      draw: async () =>
        new Promise((resolve, reject) => {
          if (!hang) {
            resolve(png);
            return;
          }
          browsers.onClose.add(() => reject(new Error(`Browser closed.`)));
        })
    });
    const slow = await exportPng();
    expect(slow.status).toBe(504);
    expect(slow.body.toString()).toMatch(/longer than 0\.15 seconds/);
    expect(browsers.closed).toBe(1);
    hang = false;
    // The slot is free again once the drawing has really stopped, and a new browser is launched.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect((await exportPng()).status).toBe(200);
    expect(browsers.launched).toBe(2);
  });

  it(`says plainly when this machine cannot draw, rather than failing`, async () => {
    await start({
      launch: async () => {
        await Promise.resolve();
        throw new Error(`no browser`);
      }
    });
    const before = await send(`${server.url}api/render`);
    expect(JSON.parse(before.body.toString())).toEqual({ available: true });
    const reply = await exportPng();
    expect(reply.status).toBe(503);
    expect(reply.body.toString()).toMatch(
      /This machine cannot draw a PNG: Playwright's Chromium could not be launched \(no browser\)/
    );
    // And from then on the status says so before anyone tries.
    const after = await send(`${server.url}api/render`);
    expect(JSON.parse(after.body.toString())).toMatchObject({
      available: false,
      reason: expect.stringMatching(/cannot draw a PNG/)
    });
  });

  it.each([
    [`a body that is not a request`, `{"baseVersion": 7}`, 400],
    [
      `too many viewports`,
      JSON.stringify({
        baseVersion: `x`,
        viewports: Array.from({ length: 9 }, () => ({ width: 300 }))
      }),
      400
    ],
    [
      `a theme that does not exist`,
      JSON.stringify({ baseVersion: `x`, theme: `neon` }),
      400
    ],
    [`a body that is not JSON`, `not json`, 400],
    [
      `a body far larger than a request`,
      JSON.stringify({ baseVersion: `x`.repeat(70_000) }),
      413
    ]
  ])(`refuses %s without drawing`, async (_, body, status) => {
    expect((await exportPng(body)).status).toBe(status);
    expect(drawn).toHaveLength(0);
  });

  it(`keeps the bridge's checks: the secret, its own Host and Origin, JSON only, and POST to draw`, async () => {
    const port = String(server.port);
    const body = JSON.stringify({ baseVersion: sha(sceneText) });
    const json = { "Content-Type": `application/json` };
    expect(
      (
        await send(`http://127.0.0.1:${port}/api/render`, {
          method: `POST`,
          headers: json,
          body
        })
      ).status
    ).toBe(403);
    expect(
      (await exportPng(undefined, { Host: `attacker.example:${port}` })).status
    ).toBe(403);
    // A page on another site can send a POST; its Origin gives it away.
    expect(
      (await exportPng(undefined, { Origin: `https://attacker.example` }))
        .status
    ).toBe(403);
    expect(
      (
        await send(`${server.url}api/render`, {
          method: `POST`,
          headers: { "Content-Type": `text/plain` },
          body
        })
      ).status
    ).toBe(415);
    expect(
      (
        await send(`${server.url}api/render`, {
          method: `PUT`,
          headers: json,
          body
        })
      ).status
    ).toBe(405);
    expect(drawn).toHaveLength(0);
    expect(browsers.launched).toBe(0);
  });

  it(`has nothing to draw without a file`, async () => {
    const draft = await startStudioServer({ staticDir, port: 0 });
    try {
      const reply = await send(`${draft.url}api/render`, {
        method: `POST`,
        headers: { "Content-Type": `application/json` },
        body: `{"baseVersion":"x"}`
      });
      expect(reply.status).toBe(404);
    } finally {
      await draft.close();
    }
  });
});

describe(`the bridge's PNG export, with a real browser`, () => {
  it(`draws the file with the Node renderer and gives back a PNG`, async () => {
    // The renderer draws with the stylesheet `vp pack` compiles, so this runs the package's built bridge, as the studio command does.
    const built = new URL(`../../../dist/bridge/server.mjs`, import.meta.url);
    if (!existsSync(built)) {
      throw new Error(
        `The built bridge is missing at ${fileURLToPath(built)}. This spec runs the package's dist, as the studio command does. Run \`vp run build\` in packages/preview, then run the tests again.`
      );
    }
    const bridge: typeof Bridge = await import(built.href);
    const dir = await mkdtemp(join(tmpdir(), `discordkit-preview-export-`));
    const file = join(dir, `card.json`);
    const staticDir = join(dir, `studio`);
    await mkdir(staticDir);
    await writeFile(
      join(staticDir, `index.html`),
      `<html><head></head></html>`
    );
    const text = `{"messages":[{"payload":{"content":"Drawn by the bridge"}}],"width":320}`;
    await writeFile(file, text);
    const server = await bridge.startStudioServer({
      file,
      staticDir,
      port: 0,
      cwd: dir,
      cacheDir: join(dir, `cache`),
      ...(process.env.CI ? { channel: `chrome` } : {})
    });
    try {
      const reply = await send(`${server.url}api/render`, {
        method: `POST`,
        headers: { "Content-Type": `application/json` },
        body: JSON.stringify({ baseVersion: sha(text) })
      });
      // The refusal's message, if any, says why.
      expect({
        status: reply.status,
        refusal: reply.status === 200 ? `` : reply.body.toString()
      }).toEqual({ status: 200, refusal: `` });
      expect(reply.body.subarray(0, 8).equals(png)).toBe(true);
      // A PNG's width is in its header: the scene's 320-pixel column at scale 1.
      expect(reply.body.readUInt32BE(16)).toBe(320);
    } finally {
      await server.close();
      await rm(dir, { recursive: true, force: true });
    }
  }, 120_000);
});
