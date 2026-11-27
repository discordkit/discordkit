import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { twemojiBase } from "../../format/emoji.js";
import { startStudioServer, type StudioServer } from "../server.js";

/**
 * Studio's preview draws Unicode emoji as Twemoji. Loaded straight from the CDN, each page load waited on it, and a slow or blocked network drew nothing where the emoji should be. The bridge now serves them from the renderer's own asset cache, fetching each once. These specs hold that route to the bridge's rules: it fetches nothing but Twemoji's own files, reads and writes nothing but the cache, and keeps every check the other routes have.
 */

interface Reply {
  status: number;
  type: string | undefined;
  body: string;
}

const get = async (
  url: string,
  headers: Record<string, string> = {},
  method = `GET`
): Promise<Reply> =>
  new Promise((resolve, reject) => {
    const req = httpRequest(url, { method, headers }, (res) => {
      let body = ``;
      res.setEncoding(`utf8`);
      res.on(`data`, (chunk: string) => (body += chunk));
      res.on(`end`, () =>
        resolve({
          status: res.statusCode ?? 0,
          type: res.headers[`content-type`],
          body
        })
      );
    });
    req.on(`error`, reject);
    req.end();
  });

const fire = `<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>`;

describe(`the bridge's emoji route`, () => {
  let dir: string;
  let cacheDir: string;
  let server: StudioServer;
  let fetched: string[];

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), `discordkit-preview-emoji-`));
    cacheDir = join(dir, `cache`);
    const staticDir = join(dir, `studio`);
    await mkdir(staticDir);
    await writeFile(
      join(staticDir, `index.html`),
      `<html><head></head></html>`
    );
    const file = join(dir, `scene.json`);
    await writeFile(file, `{"messages":[]}`);
    fetched = [];
    server = await startStudioServer({
      file,
      staticDir,
      port: 0,
      cwd: dir,
      cacheDir,
      fetch: async (input) => {
        const url = input instanceof Request ? input.url : input.toString();
        fetched.push(url);
        await new Promise((resolve) => setTimeout(resolve, 20));
        return url.endsWith(`/1f525.svg`)
          ? new Response(fire, { headers: { "Content-Type": `image/svg+xml` } })
          : new Response(`Not found`, { status: 404 });
      }
    });
    return async () => {
      await server.close();
      await rm(dir, { recursive: true, force: true });
    };
  });

  it(`fetches an emoji once, into the renderer's cache, and serves it from there after`, async () => {
    const [first, second] = await Promise.all([
      get(`${server.url}api/emoji/1f525.svg`),
      get(`${server.url}api/emoji/1f525.svg`)
    ]);
    expect(first).toMatchObject({
      status: 200,
      type: `image/svg+xml`,
      body: fire
    });
    expect(second.body).toBe(fire);
    // Two images on the page asking at once still make one fetch, from the pinned release.
    expect(fetched).toEqual([`${twemojiBase}/1f525.svg`]);
    // It is in the cache `render` reads, so the next page load (and the next render) needs no network.
    expect((await readdir(cacheDir)).length).toBeGreaterThan(0);
    await get(`${server.url}api/emoji/1f525.svg`);
    expect(fetched).toHaveLength(1);
  });

  it(`says why when an emoji cannot be had`, async () => {
    const reply = await get(`${server.url}api/emoji/1f9ff.svg`);
    expect(reply.status).toBe(502);
    expect(reply.body).toContain(`404`);
  });

  it.each([
    `..%2f..%2fsecret.svg`,
    `1f525.png`,
    `https%3a%2f%2fexample.com%2fa.svg`,
    `1F525.svg`,
    `1f525.svg%3fx`
  ])(
    `refuses %s, which is not a Twemoji file name, without fetching anything`,
    async (name) => {
      const reply = await get(`${server.url}api/emoji/${name}`);
      expect(reply.status).toBe(404);
      expect(fetched).toEqual([]);
    }
  );

  it(`keeps the bridge's checks: the secret, its own Host and Origin, and reads only`, async () => {
    const port = String(server.port);
    expect(
      (await get(`http://127.0.0.1:${port}/api/emoji/1f525.svg`)).status
    ).toBe(403);
    expect(
      (
        await get(`${server.url}api/emoji/1f525.svg`, {
          Host: `attacker.example:${port}`
        })
      ).status
    ).toBe(403);
    expect(
      (
        await get(`${server.url}api/emoji/1f525.svg`, {
          Origin: `https://attacker.example`
        })
      ).status
    ).toBe(403);
    expect(
      (await get(`${server.url}api/emoji/1f525.svg`, {}, `PUT`)).status
    ).toBe(405);
    expect(fetched).toEqual([]);
  });

  it(`serves the image sandboxed, so an SVG opened on its own cannot run script on Studio's origin`, async () => {
    const reply = await new Promise<unknown>((resolve, reject) => {
      const req = httpRequest(`${server.url}api/emoji/1f525.svg`, (res) => {
        res.resume();
        resolve(res.headers[`content-security-policy`]);
      });
      req.on(`error`, reject);
      req.end();
    });
    expect(reply).toMatch(/^sandbox/);
  });
});
