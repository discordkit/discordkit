import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  unlink,
  writeFile
} from "node:fs/promises";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { createServer as createNetServer } from "node:net";
import { networkInterfaces, tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import type { FileSnapshot, SaveResult } from "../protocol.js";
import {
  startStudioServer,
  StudioServerError,
  type StudioServer
} from "../server.js";

/**
 * The bridge lets a browser tab write a file on disk, and any web page the person has open can make their browser send requests to 127.0.0.1. These specs hold it to the checks that keep that safe, each against a real temporary file and real HTTP requests: loopback only, a secret per run, its own `Host` and `Origin` only, one file, and writes that never replace a change they had not seen.
 */

interface Reply {
  status: number;
  headers: IncomingMessage[`headers`];
  body: string;
}

/** A raw HTTP request, so a spec can send the `Host` and `Origin` a hostile page or a rebinding attack would. */
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
      let text = ``;
      res.setEncoding(`utf8`);
      res.on(`data`, (chunk: string) => (text += chunk));
      res.on(`end`, () =>
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: text
        })
      );
    });
    req.on(`error`, reject);
    req.end(body);
  });

const sha = (text: string): string =>
  createHash(`sha256`).update(Buffer.from(text, `utf8`)).digest(`hex`);

const snapshotOf = (reply: Reply): FileSnapshot =>
  JSON.parse(reply.body) as FileSnapshot;

const resultOf = (reply: Reply): SaveResult =>
  JSON.parse(reply.body) as SaveResult;

/** Opens the change stream and collects each snapshot it announces. */
const listen = async (
  url: string
): Promise<{ events: FileSnapshot[]; close: () => void }> =>
  new Promise((resolve, reject) => {
    const events: FileSnapshot[] = [];
    const req = httpRequest(`${url}api/events`, (res) => {
      let buffer = ``;
      res.setEncoding(`utf8`);
      res.on(`data`, (chunk: string) => {
        buffer += chunk;
        const frames = buffer.split(`\n\n`);
        buffer = frames.pop() ?? ``;
        for (const frame of frames) {
          const data = frame
            .split(`\n`)
            .find((line) => line.startsWith(`data: `));
          if (data !== undefined) {
            events.push(JSON.parse(data.slice(6)) as FileSnapshot);
          }
        }
      });
      resolve({ events, close: () => req.destroy() });
    });
    req.on(`error`, (error) => {
      if (!req.destroyed) reject(error);
    });
    req.end();
  });

const until = async (
  check: () => boolean,
  { timeout = 1000, what }: { timeout?: number; what: string }
): Promise<number> => {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeout) {
      throw new Error(
        `Timed out after ${String(timeout)} ms waiting for ${what}.`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return Date.now() - start;
};

const sceneText = `{\n  "messages": [{ "payload": { "content": "Hello" } }]\n}\n`;

describe(`the Studio file bridge`, () => {
  let dir: string;
  let file: string;
  let staticDir: string;
  let server: StudioServer;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), `discordkit-preview-bridge-`));
    file = join(dir, `scene.json`);
    staticDir = join(dir, `studio`);
    await mkdir(join(staticDir, `assets`), { recursive: true });
    await writeFile(
      join(staticDir, `index.html`),
      `<!doctype html><html><head><title>Studio</title></head><body></body></html>`
    );
    await writeFile(join(staticDir, `assets`, `app.js`), `export {};`);
    await writeFile(join(dir, `secret.txt`), `not for the browser`);
    await writeFile(file, sceneText);
    server = await startStudioServer({ file, staticDir, port: 0, cwd: dir });
    return async () => {
      await server.close();
      await rm(dir, { recursive: true, force: true });
    };
  });

  describe(`listens on the loopback interface only`, () => {
    it(`prints an address on 127.0.0.1`, () => {
      expect(new URL(server.url).hostname).toBe(`127.0.0.1`);
    });

    it(`cannot be reached through this machine's network address`, async () => {
      // Another machine on the network would connect through one of these. When the machine has none, the address check above is the whole test.
      const external = Object.values(networkInterfaces())
        .flat()
        .find((entry) => entry?.family === `IPv4` && !entry.internal);
      const reached =
        external === undefined
          ? false
          : await send(
              `http://${external.address}:${String(server.port)}/`
            ).then(
              () => true,
              () => false
            );
      expect(reached).toBe(false);
    });
  });

  describe(`needs the per-run secret`, () => {
    it(`refuses every route without it, so a page that guesses the port gets nothing`, async () => {
      const port = String(server.port);
      for (const path of [`/`, `/api/file`, `/index.html`, `/0000/api/file`]) {
        const reply = await send(`http://127.0.0.1:${port}${path}`);
        expect(reply.status).toBe(403);
        expect(reply.body).not.toContain(server.secret);
        expect(reply.body).not.toContain(sceneText);
      }
    });

    it(`refuses a secret that is right except for its last character`, async () => {
      const wrong = `${server.secret.slice(0, -1)}${server.secret.endsWith(`0`) ? `1` : `0`}`;
      const reply = await send(
        `http://127.0.0.1:${String(server.port)}/${wrong}/api/file`
      );
      expect(reply.status).toBe(403);
    });

    it(`is a new secret on every run`, async () => {
      const other = await startStudioServer({ file, staticDir, port: 0 });
      try {
        expect(other.secret).not.toBe(server.secret);
        expect(other.secret).toMatch(/^[0-9a-f]{32}$/);
      } finally {
        await other.close();
      }
    });

    it(`serves the app and the file with it`, async () => {
      expect((await send(server.url)).status).toBe(200);
      const reply = await send(`${server.url}api/file`);
      expect(reply.status).toBe(200);
      expect(snapshotOf(reply)).toMatchObject({
        exists: true,
        text: sceneText,
        version: sha(sceneText)
      });
    });

    it(`sends the address without its trailing slash to the one with it, which the app's relative links need`, async () => {
      const reply = await send(server.url.slice(0, -1));
      expect(reply.status).toBe(308);
      expect(reply.headers.location).toBe(new URL(server.url).pathname);
    });

    it(`keeps the secret out of the Referer sent to the image hosts a scene names`, async () => {
      const reply = await send(server.url);
      expect(reply.headers[`referrer-policy`]).toBe(`no-referrer`);
    });
  });

  describe(`answers only to its own Host and Origin`, () => {
    it(`refuses a Host naming another site, which is what a DNS-rebinding attack sends`, async () => {
      const reply = await send(`${server.url}api/file`, {
        headers: { Host: `attacker.example:${String(server.port)}` }
      });
      expect(reply.status).toBe(403);
      expect(reply.body).not.toContain(`Hello`);
    });

    it(`accepts localhost as well as 127.0.0.1`, async () => {
      const reply = await send(`${server.url}api/file`, {
        headers: { Host: `localhost:${String(server.port)}` }
      });
      expect(reply.status).toBe(200);
    });

    it(`refuses a read from another site's page`, async () => {
      const reply = await send(`${server.url}api/file`, {
        headers: { Origin: `https://attacker.example` }
      });
      expect(reply.status).toBe(403);
      expect(reply.body).not.toContain(`Hello`);
    });

    it(`refuses a write from another site's page, even with the secret and the right version`, async () => {
      const reply = await send(`${server.url}api/file`, {
        method: `PUT`,
        headers: {
          Origin: `https://attacker.example`,
          "Content-Type": `application/json`
        },
        body: JSON.stringify({
          text: `{"owned":true}`,
          baseVersion: sha(sceneText)
        })
      });
      expect(reply.status).toBe(403);
      await expect(readFile(file, `utf8`)).resolves.toBe(sceneText);
    });

    it(`accepts its own origin`, async () => {
      const reply = await send(`${server.url}api/file`, {
        headers: { Origin: `http://127.0.0.1:${String(server.port)}` }
      });
      expect(reply.status).toBe(200);
    });

    it(`cannot be framed by another page`, async () => {
      const reply = await send(server.url);
      expect(reply.headers[`x-frame-options`]).toBe(`DENY`);
      expect(reply.headers[`content-security-policy`]).toContain(
        `frame-ancestors 'none'`
      );
    });
  });

  describe(`reads and writes one file`, () => {
    it.each([
      `../secret.txt`,
      `..%2fsecret.txt`,
      `%2e%2e%2fsecret.txt`,
      `assets/..%2f..%2fsecret.txt`,
      `..%5csecret.txt`
    ])(`does not serve %s from outside the app`, async (path) => {
      const reply = await send(`${server.url}${path}`);
      expect(reply.status).not.toBe(200);
      expect(reply.body).not.toContain(`not for the browser`);
    });

    it(`serves an attachment the scene lists, as an image`, async () => {
      await writeFile(join(dir, `card.png`), `png bytes`);
      await writeFile(
        file,
        JSON.stringify({
          messages: [{ payload: { content: `` } }],
          context: {
            attachments: {
              "card.png": { path: `card.png` },
              "notes.png": { path: `secret.txt` }
            }
          }
        })
      );
      const reply = await send(`${server.url}api/attachments/card.png`);
      expect(reply.status).toBe(200);
      expect(reply.headers[`content-type`]).toBe(`image/png`);
      expect(reply.body).toBe(`png bytes`);
      // Named as an image but pointing at a file that is not one: refused by its real extension.
      const disguised = await send(`${server.url}api/attachments/notes.png`);
      expect(disguised.status).toBe(415);
      expect(disguised.body).not.toContain(`not for the browser`);
    });

    it(`does not serve a file the scene does not list`, async () => {
      const reply = await send(`${server.url}api/attachments/secret.txt`);
      expect(reply.status).toBe(404);
      expect(reply.body).not.toContain(`not for the browser`);
    });

    it(`refuses to start on a file that does not exist, so a mistyped path never creates one`, async () => {
      await expect(
        startStudioServer({
          file: join(dir, `missing.json`),
          staticDir,
          port: 0
        })
      ).rejects.toThrow(StudioServerError);
    });
  });

  describe(`writes only on top of the version it was based on`, () => {
    const put = async (
      body: unknown,
      type = `application/json`
    ): Promise<Reply> =>
      send(`${server.url}api/file`, {
        method: `PUT`,
        headers: { "Content-Type": type },
        body: typeof body === `string` ? body : JSON.stringify(body)
      });

    it(`writes when the file is still at the base version, and returns the new version`, async () => {
      const text = `{"messages":[{"payload":{"content":"Edited"}}]}`;
      const reply = await put({ text, baseVersion: sha(sceneText) });
      expect(reply.status).toBe(200);
      expect(resultOf(reply)).toEqual({
        saved: true,
        version: sha(text)
      });
      await expect(readFile(file, `utf8`)).resolves.toBe(text);
    });

    it(`refuses a write based on an older version, leaves the agent's change in place, and returns it`, async () => {
      const agent = `{"messages":[{"payload":{"content":"Agent's edit"}}]}`;
      await writeFile(file, agent);
      const reply = await put({
        text: `{"messages":[{"payload":{"content":"Stale tab"}}]}`,
        baseVersion: sha(sceneText)
      });
      expect(reply.status).toBe(409);
      expect(resultOf(reply)).toMatchObject({
        saved: false,
        current: { exists: true, text: agent, version: sha(agent) }
      });
      await expect(readFile(file, `utf8`)).resolves.toBe(agent);
    });

    it(`refuses a write to a file that has been deleted, rather than recreating it`, async () => {
      await unlink(file);
      const reply = await put({ text: `{}`, baseVersion: sha(sceneText) });
      expect(reply.status).toBe(409);
      expect(resultOf(reply)).toMatchObject({
        saved: false,
        current: { exists: false }
      });
    });

    it(`refuses text that is not JSON, so a half-typed edit never replaces the file`, async () => {
      const reply = await put({
        text: `{"messages": [`,
        baseVersion: sha(sceneText)
      });
      expect(reply.status).toBe(400);
      await expect(readFile(file, `utf8`)).resolves.toBe(sceneText);
    });

    it(`refuses a body that is not JSON, which a cross-site form could send without a preflight`, async () => {
      const reply = await put(
        JSON.stringify({ text: `{}`, baseVersion: sha(sceneText) }),
        `text/plain`
      );
      expect(reply.status).toBe(415);
      await expect(readFile(file, `utf8`)).resolves.toBe(sceneText);
    });

    it(`keeps a byte-order mark the file started with`, async () => {
      await writeFile(file, `﻿${sceneText}`);
      const snapshot = snapshotOf(await send(`${server.url}api/file`));
      if (!snapshot.exists) throw new Error(`The file should exist.`);
      expect(snapshot.text).toBe(sceneText);
      const reply = await put({ text: `{}`, baseVersion: snapshot.version });
      expect(reply.status).toBe(200);
      const bytes = await readFile(file);
      expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
      expect(bytes.subarray(3).toString(`utf8`)).toBe(`{}`);
    });
  });

  describe(`announces changes from outside`, () => {
    it(`sends the current file to a new listener, then each change within a second`, async () => {
      const stream = await listen(server.url);
      try {
        await until(() => stream.events.length === 1, {
          what: `the first snapshot`
        });
        expect(stream.events[0]).toMatchObject({
          exists: true,
          text: sceneText
        });
        const edited = `{"messages":[{"payload":{"content":"From an agent"}}]}`;
        await writeFile(file, edited);
        const took = await until(() => stream.events.length === 2, {
          what: `the change to be announced`
        });
        expect(took).toBeLessThan(1000);
        expect(stream.events[1]).toMatchObject({
          text: edited,
          version: sha(edited)
        });
      } finally {
        stream.close();
      }
    });

    it(`announces a save that writes the same bytes again only once`, async () => {
      const stream = await listen(server.url);
      try {
        await until(() => stream.events.length === 1, {
          what: `the first snapshot`
        });
        const edited = `{"messages":[]}`;
        await writeFile(file, edited);
        await writeFile(file, edited);
        await until(() => stream.events.length === 2, { what: `the change` });
        await writeFile(file, edited);
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(stream.events).toHaveLength(2);
      } finally {
        stream.close();
      }
    });

    it(`follows an editor that saves by writing a new file and renaming it over the old one`, async () => {
      const stream = await listen(server.url);
      try {
        await until(() => stream.events.length === 1, {
          what: `the first snapshot`
        });
        const replaced = `{"messages":[{"payload":{"content":"Replaced"}}]}`;
        await writeFile(join(dir, `scene.json.tmp`), replaced);
        await rename(join(dir, `scene.json.tmp`), file);
        await until(
          () =>
            stream.events.some(
              (event) => event.exists && event.text === replaced
            ),
          { what: `the replaced file to be announced` }
        );
        // And it keeps following the new file afterwards.
        const again = `{"messages":[{"payload":{"content":"Again"}}]}`;
        await writeFile(file, again);
        await until(
          () =>
            stream.events.some((event) => event.exists && event.text === again),
          { what: `a later write to the replaced file` }
        );
        expect(stream.events.at(-1)).toMatchObject({
          exists: true,
          text: again
        });
      } finally {
        stream.close();
      }
    });

    it(`says when the file is deleted, and when it comes back`, async () => {
      const stream = await listen(server.url);
      try {
        await until(() => stream.events.length === 1, {
          what: `the first snapshot`
        });
        await unlink(file);
        await until(() => stream.events.some((event) => !event.exists), {
          what: `the deletion`,
          timeout: 2000
        });
        await writeFile(file, sceneText);
        await until(() => stream.events.at(-1)?.exists === true, {
          what: `the file to come back`
        });
        expect(stream.events.at(-1)).toMatchObject({
          exists: true,
          text: sceneText
        });
      } finally {
        stream.close();
      }
    });

    it(`tells every open tab about a write made from one of them`, async () => {
      const stream = await listen(server.url);
      try {
        await until(() => stream.events.length === 1, {
          what: `the first snapshot`
        });
        const text = `{"messages":[{"payload":{"content":"From the other tab"}}]}`;
        await send(`${server.url}api/file`, {
          method: `PUT`,
          headers: { "Content-Type": `application/json` },
          body: JSON.stringify({ text, baseVersion: sha(sceneText) })
        });
        await until(() => stream.events.length === 2, { what: `the write` });
        expect(stream.events[1]).toMatchObject({ text, version: sha(text) });
      } finally {
        stream.close();
      }
    });
  });

  describe(`without a file`, () => {
    it(`serves the app as a draft editor, with no file routes and no bridge marker`, async () => {
      const draft = await startStudioServer({ staticDir, port: 0 });
      try {
        expect((await send(`${draft.url}api/file`)).status).toBe(404);
        const page = await send(draft.url);
        expect(page.status).toBe(200);
        expect(page.body).not.toContain(`discordkit-preview-bridge`);
      } finally {
        await draft.close();
      }
    });

    it(`marks the page it serves with a file, so the app knows to use the bridge`, async () => {
      expect((await send(server.url)).body).toContain(
        `<meta name="discordkit-preview-bridge" content="1">`
      );
    });
  });

  describe(`ports`, () => {
    it(`says which port is taken and what to do, when asked for one in use`, async () => {
      const blocker = createNetServer();
      await new Promise<void>((resolve) =>
        blocker.listen(0, `127.0.0.1`, resolve)
      );
      const address = blocker.address();
      const taken =
        typeof address === `object` && address !== null ? address.port : 0;
      try {
        await expect(
          startStudioServer({ file, staticDir, port: taken })
        ).rejects.toThrow(/another program is using it.*--port/);
      } finally {
        await new Promise((resolve) => blocker.close(resolve));
      }
    });
  });
});
