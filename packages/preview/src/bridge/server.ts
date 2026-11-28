import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse
} from "node:http";
import { basename, extname, isAbsolute, relative, resolve } from "node:path";
import { imageTypes } from "../node/assets.js";
import { readScene } from "../scene/intake.js";
import {
  bridgeMetaName,
  bridgeRoutes,
  fileEvent,
  type BridgeError,
  type FileSnapshot,
  type FileVersion,
  type SaveResult
} from "./protocol.js";
import { watchFile, type WatchOptions } from "./watch.js";

/** Where Studio is served when no port is asked for and this one is free. A fixed port keeps the page's origin, and so its stored draft, the same from one run to the next. */
export const preferredPort = 5480;

/** The largest scene the bridge accepts in one write. Real scenes are a few kilobytes; this only stops a runaway request filling the disk. */
export const maxBodyBytes = 8 * 1024 * 1024;

export interface StudioServerOptions {
  /** The one file Studio reads and writes, as an absolute path. Without one, Studio works on a draft in the browser's storage. */
  file?: string;
  /** The built Studio app: a directory holding `index.html` and its assets. */
  staticDir: string;
  /** The port to listen on. A port in use is an error. Without one, {@link preferredPort} is tried, then any free port. `0` means any free port. */
  port?: number;
  /** What attachment paths in the scene are resolved against, as `render` resolves them. Defaults to the working directory. */
  cwd?: string;
  /** The per-run secret. Generated when not given; tests pass their own. */
  secret?: string;
  watch?: WatchOptions;
}

export interface StudioServer {
  /** The address to open, with the secret in it. */
  url: string;
  port: number;
  secret: string;
  close: () => Promise<void>;
}

/** Thrown when the server cannot start, with a message that says why and what to do. */
export class StudioServerError extends Error {
  override name = `StudioServerError`;
}

const host = `127.0.0.1`;

const versionOf = (bytes: Buffer): FileVersion =>
  createHash(`sha256`).update(bytes).digest(`hex`);

const byteOrderMark = Buffer.from([0xef, 0xbb, 0xbf]);

const reasonOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const codeOf = (error: unknown): string | undefined =>
  error instanceof Error && `code` in error && typeof error.code === `string`
    ? error.code
    : undefined;

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** What one read of the file found: its bytes, or that it is not there. */
type Read = { exists: true; bytes: Buffer } | { exists: false };

/**
 * Reads the file, retrying briefly through the states a save passes through on Windows: the writer holding it open (`EBUSY`, `EPERM`), or an editor that deletes it and writes a new one in its place (`ENOENT` for a moment).
 */
const readBytes = async (path: string): Promise<Read> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return { exists: true, bytes: await readFile(path) };
    } catch (error) {
      const code = codeOf(error);
      const transient =
        code === `EBUSY` || code === `EPERM` || code === `ENOENT`;
      if (!transient || attempt >= 4) {
        if (code === `ENOENT`) return { exists: false };
        throw error;
      }
      await sleep(40);
    }
  }
};

const staticTypes: Partial<Record<string, string>> = {
  ".html": `text/html; charset=utf-8`,
  ".js": `text/javascript; charset=utf-8`,
  ".mjs": `text/javascript; charset=utf-8`,
  ".css": `text/css; charset=utf-8`,
  ".json": `application/json; charset=utf-8`,
  ".svg": `image/svg+xml`,
  ".png": `image/png`,
  ".ico": `image/x-icon`,
  ".woff2": `font/woff2`,
  ".woff": `font/woff`,
  ".txt": `text/plain; charset=utf-8`
};

/**
 * The app's own policy. Scripts and connections stay on this server. Images may come from anywhere, because a scene names avatars, emoji and gallery images by URL and the preview draws them as the Discord client would. No other site may frame the page.
 */
const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https: http:`,
  `font-src 'self' data:`,
  `connect-src 'self'`,
  `frame-ancestors 'none'`,
  `base-uri 'none'`,
  `form-action 'none'`,
  `object-src 'none'`
].join(`; `);

/** Sent with every response. The secret is in the page's address, so it must never leave in a `Referer` header to the image hosts a scene names. */
const commonHeaders = {
  "Cache-Control": `no-store`,
  "Referrer-Policy": `no-referrer`,
  "X-Content-Type-Options": `nosniff`,
  "X-Frame-Options": `DENY`,
  "Cross-Origin-Resource-Policy": `same-origin`
};

const send = (
  response: ServerResponse,
  status: number,
  body: string | Buffer,
  headers: Record<string, string>
): void => {
  response.writeHead(status, { ...commonHeaders, ...headers });
  response.end(body);
};

const sendJson = (
  response: ServerResponse,
  status: number,
  value: unknown
): void => {
  send(response, status, JSON.stringify(value), {
    "Content-Type": `application/json; charset=utf-8`
  });
};

const refuse = (
  response: ServerResponse,
  status: number,
  message: string,
  headers: Record<string, string> = {}
): void => {
  const body: BridgeError = { error: { message } };
  send(response, status, JSON.stringify(body), {
    "Content-Type": `application/json; charset=utf-8`,
    ...headers
  });
};

/** A request body, up to `limit` bytes. Resolves to undefined when it is longer, having stopped reading. */
const readBody = async (
  request: IncomingMessage,
  limit: number
): Promise<Buffer | undefined> => {
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    length += buffer.length;
    if (length > limit) return undefined;
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
};

const isSaveRequest = (
  value: unknown
): value is { text: string; baseVersion: string } =>
  typeof value === `object` &&
  value !== null &&
  `text` in value &&
  typeof value.text === `string` &&
  `baseVersion` in value &&
  typeof value.baseVersion === `string`;

/** Whether `child` is `root` or inside it, after resolving `..`. */
const isInside = (root: string, child: string): boolean => {
  const path = relative(root, child);
  return path === `` || (!path.startsWith(`..`) && !isAbsolute(path));
};

const listen = async (server: Server, port: number): Promise<number> =>
  new Promise((resolve, reject) => {
    const onError = (error: Error): void => {
      server.off(`listening`, onListening);
      reject(error);
    };
    const onListening = (): void => {
      server.off(`error`, onError);
      const address = server.address();
      resolve(
        typeof address === `object` && address !== null ? address.port : port
      );
    };
    server.once(`error`, onError);
    server.once(`listening`, onListening);
    server.listen(port, host);
  });

/**
 * Starts the file bridge `discordkit-preview studio` runs: a small HTTP server on the loopback interface that serves Studio's web app, the one scene file it was given, a write endpoint for that file, and a stream of change events from watching it.
 *
 * Its safety rests on five checks, each of which matters because any web page the person visits can make their browser send requests to `127.0.0.1`:
 *
 * - **Loopback only.** It listens on 127.0.0.1, so nothing else on the network can reach it.
 * - **A per-run secret** in the address. Every route lives under `/<secret>/`; a page that does not know it gets nothing.
 * - **`Host` and `Origin` must be its own.** A `Host` naming any other site is a DNS-rebinding attempt, and an `Origin` from any other site is a cross-site request, so both are refused.
 * - **One file.** It reads and writes only the file it was given. Attachments the scene lists are served read-only, and only as images.
 * - **Versioned writes.** A write names the version it was based on and is refused when the file has changed since, so an agent's edit to the file is never silently replaced by a browser tab that had not seen it.
 */
export const startStudioServer = async ({
  file,
  staticDir,
  port,
  cwd = process.cwd(),
  secret = randomBytes(16).toString(`hex`),
  watch: watchOptions
}: StudioServerOptions): Promise<StudioServer> => {
  const root = resolve(staticDir);
  const index = resolve(root, `index.html`);
  try {
    if (!(await stat(index)).isFile()) throw new Error(`not a file`);
  } catch (error) {
    throw new StudioServerError(
      `discordkit-preview studio could not find Studio's web app at ${index}: ${reasonOf(error)}. The command serves the copy built into the package's dist/studio. In this repository, build it with \`vp run build\` in packages/preview; from an installed package, reinstall @discordkit/preview.`,
      { cause: error }
    );
  }

  const prefix = `/${secret}/`;
  const secretBytes = Buffer.from(secret);
  /** Whether a request's first path segment is the secret, compared in constant time so its bytes cannot be guessed one at a time. */
  const hasSecret = (pathname: string): boolean => {
    const given = Buffer.from(pathname.slice(1, prefix.length - 1));
    return (
      pathname.startsWith(`/`) &&
      pathname.charAt(prefix.length - 1) === `/` &&
      given.length === secretBytes.length &&
      timingSafeEqual(given, secretBytes)
    );
  };

  // The file's state as last read, so every client starts from the same snapshot and a change is announced once, however many events one save raises.
  const name = file === undefined ? `` : basename(file);
  let current: FileSnapshot | undefined;
  /** Whether the file started with a byte-order mark, which JSON does not allow and the app never sees, so a write puts it back. */
  let bom = false;
  const snapshotOf = (read: Read): FileSnapshot => {
    if (file === undefined || !read.exists) {
      return { exists: false, name, path: file ?? `` };
    }
    bom = read.bytes.subarray(0, 3).equals(byteOrderMark);
    return {
      exists: true,
      name,
      path: file,
      version: versionOf(read.bytes),
      text: read.bytes.subarray(bom ? 3 : 0).toString(`utf8`)
    };
  };
  const same = (a: FileSnapshot | undefined, b: FileSnapshot): boolean =>
    a !== undefined &&
    a.exists === b.exists &&
    (!a.exists || !b.exists || a.version === b.version);

  const clients = new Set<ServerResponse>();
  const broadcast = (snapshot: FileSnapshot): void => {
    const frame = `event: ${fileEvent}\ndata: ${JSON.stringify(snapshot)}\n\n`;
    for (const client of clients) client.write(frame);
  };

  // Reads and writes take turns, so a write's check that the file is still at its base version and the write itself cannot have another read or write between them.
  let queue: Promise<void> = Promise.resolve();
  const exclusive = async <T>(task: () => Promise<T>): Promise<T> => {
    const previous = queue;
    let release = (): void => undefined;
    queue = new Promise((resolve) => {
      release = resolve;
    });
    try {
      await previous;
      return await task();
    } finally {
      release();
    }
  };

  const refresh = async (): Promise<FileSnapshot> =>
    exclusive(async () => {
      if (file === undefined) return snapshotOf({ exists: false });
      const next = snapshotOf(await readBytes(file));
      if (!same(current, next)) {
        current = next;
        broadcast(next);
      }
      return next;
    });

  if (file !== undefined) {
    try {
      await refresh();
    } catch (error) {
      throw new StudioServerError(
        `discordkit-preview studio could not read ${file}: ${reasonOf(error)}. Studio edits that file in place, so it must be readable. Check the path and its permissions, then run the command again.`,
        { cause: error }
      );
    }
    if (current?.exists !== true) {
      throw new StudioServerError(
        `discordkit-preview studio was asked to edit ${file}, but there is no file there. Studio reads and writes exactly the file it is given and never creates one, so that a mistyped path cannot start a new document by accident. Check the path, or create the file first (an empty scene is \`{"messages":[{"payload":{"content":""}}]}\`), then run the command again. To try Studio without a file, run it with no file and it keeps a draft in the browser.`
      );
    }
  }

  const save = async (
    text: string,
    baseVersion: FileVersion
  ): Promise<{ status: number; body: SaveResult }> =>
    exclusive(async () => {
      if (file === undefined) throw new Error(`unreachable: no file`);
      const now = snapshotOf(await readBytes(file));
      if (!now.exists || now.version !== baseVersion) {
        if (!same(current, now)) {
          current = now;
          broadcast(now);
        }
        return {
          status: 409,
          body: {
            saved: false,
            current: now,
            message: now.exists
              ? `${name} was not written, because it changed on disk after this edit was made (it was at version ${baseVersion.slice(0, 8)}, and is now at ${now.version.slice(0, 8)}). Writing would have replaced that change, which may be another tool's work. Studio has loaded the file as it is now; reapply the edit to it, or overwrite it on purpose.`
              : `${name} was not written, because it is no longer on disk: it was deleted or moved after this edit was made. Studio writes only to an existing file, so that it never recreates one something else removed. Restore the file, or restart Studio on the file's new path.`
          }
        };
      }
      const text8 = Buffer.from(text, `utf8`);
      const bytes = bom ? Buffer.concat([byteOrderMark, text8]) : text8;
      // Written in place rather than replaced by a rename, so the file keeps its identity, permissions and links, and an editor holding it open sees an ordinary change.
      await writeFile(file, bytes);
      const written = snapshotOf({ exists: true, bytes });
      current = written;
      broadcast(written);
      return {
        status: 200,
        body: { saved: true, version: versionOf(bytes) }
      };
    });

  /** A change the watcher reported. A read that fails here (the file mid-replace for longer than the retries) is dropped: the next event or poll reads it again. */
  const onFileEvent = async (): Promise<void> => {
    try {
      await refresh();
    } catch {
      // See above.
    }
  };
  const watcher =
    file === undefined
      ? undefined
      : watchFile(file, () => void onFileEvent(), watchOptions);

  const server = createServer();
  let origins = new Set<string>();
  let hosts = new Set<string>();

  const serveStatic = async (
    request: IncomingMessage,
    response: ServerResponse,
    route: string
  ): Promise<void> => {
    if (request.method !== `GET` && request.method !== `HEAD`) {
      refuse(response, 405, `Studio's pages can only be read.`, {
        Allow: `GET, HEAD`
      });
      return;
    }
    let relativePath: string;
    try {
      relativePath = decodeURIComponent(route === `` ? `index.html` : route);
    } catch {
      refuse(response, 400, `The address is not valid percent-encoding.`);
      return;
    }
    const target = resolve(root, relativePath);
    if (relativePath.includes(`\0`) || !isInside(root, target)) {
      refuse(response, 404, `There is no such page in Studio.`);
      return;
    }
    let body: Buffer;
    try {
      if (!(await stat(target)).isFile()) throw new Error(`not a file`);
      body = await readFile(target);
    } catch {
      refuse(response, 404, `There is no such page in Studio.`);
      return;
    }
    const type =
      staticTypes[extname(target).toLowerCase()] ?? `application/octet-stream`;
    if (target === index) {
      const html =
        file === undefined
          ? body.toString(`utf8`)
          : body
              .toString(`utf8`)
              .replace(
                `</head>`,
                `<meta name="${bridgeMetaName}" content="1"></head>`
              );
      send(response, 200, request.method === `HEAD` ? `` : html, {
        "Content-Type": type,
        "Content-Security-Policy": contentSecurityPolicy
      });
      return;
    }
    send(response, 200, request.method === `HEAD` ? Buffer.alloc(0) : body, {
      "Content-Type": type
    });
  };

  const serveFile = async (
    request: IncomingMessage,
    response: ServerResponse
  ): Promise<void> => {
    if (request.method === `GET`) {
      sendJson(response, 200, await refresh());
      return;
    }
    if (request.method !== `PUT`) {
      refuse(
        response,
        405,
        `The scene file can be read with GET and written with PUT.`,
        {
          Allow: `GET, PUT`
        }
      );
      return;
    }
    const type = (request.headers[`content-type`] ?? ``).split(`;`)[0].trim();
    if (type !== `application/json`) {
      refuse(
        response,
        415,
        `A write must be sent as application/json, as { "text", "baseVersion" }. Studio sends it that way; another client should too.`
      );
      return;
    }
    const body = await readBody(request, maxBodyBytes);
    if (body === undefined) {
      refuse(
        response,
        413,
        `The write was refused because it is larger than ${String(maxBodyBytes / 1024 / 1024)} MB, far beyond any message scene. Check that the right content is being saved.`
      );
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(body.toString(`utf8`));
    } catch {
      parsed = undefined;
    }
    if (!isSaveRequest(parsed)) {
      refuse(
        response,
        400,
        `The write was refused because its body is not { "text": string, "baseVersion": string }. Send the new content as \`text\` and the version it was based on, from the last read, as \`baseVersion\`.`
      );
      return;
    }
    try {
      JSON.parse(parsed.text);
    } catch (error) {
      refuse(
        response,
        400,
        `The write was refused because the new content is not valid JSON (${reasonOf(error)}). The bridge writes only JSON, so that a half-typed edit can never replace the scene file. Fix the JSON, then save again.`
      );
      return;
    }
    const { status, body: result } = await save(
      parsed.text,
      parsed.baseVersion
    );
    sendJson(response, status, result);
  };

  const serveEvents = (
    request: IncomingMessage,
    response: ServerResponse
  ): void => {
    if (request.method !== `GET`) {
      refuse(response, 405, `The change stream can only be read.`, {
        Allow: `GET`
      });
      return;
    }
    response.writeHead(200, {
      ...commonHeaders,
      "Content-Type": `text/event-stream; charset=utf-8`,
      Connection: `keep-alive`
    });
    // Tell the browser to reconnect quickly if the stream drops.
    response.write(`retry: 500\n\n`);
    clients.add(response);
    request.on(`close`, () => clients.delete(response));
    if (current !== undefined) {
      response.write(
        `event: ${fileEvent}\ndata: ${JSON.stringify(current)}\n\n`
      );
    }
  };

  const serveAttachment = async (
    request: IncomingMessage,
    response: ServerResponse,
    encodedName: string
  ): Promise<void> => {
    if (request.method !== `GET` && request.method !== `HEAD`) {
      refuse(response, 405, `Attachments can only be read.`, {
        Allow: `GET, HEAD`
      });
      return;
    }
    let attachment: string;
    try {
      attachment = decodeURIComponent(encodedName);
    } catch {
      refuse(
        response,
        400,
        `The attachment name is not valid percent-encoding.`
      );
      return;
    }
    const snapshot = await refresh();
    const scene = snapshot.exists ? readScene(snapshot.text).scene : undefined;
    const entries = scene?.context?.attachments;
    const entry =
      entries !== undefined && Object.hasOwn(entries, attachment)
        ? entries[attachment]
        : undefined;
    if (entry === undefined || typeof entry.path !== `string`) {
      refuse(
        response,
        404,
        `The scene lists no attachment called ${JSON.stringify(attachment)} in \`context.attachments\`, and the bridge serves only the files the scene lists. Add it there with the path of the file on disk.`
      );
      return;
    }
    const path = resolve(cwd, entry.path);
    const contentType = imageTypes[extname(path).toLowerCase()];
    if (contentType === undefined) {
      refuse(
        response,
        415,
        `The attachment ${JSON.stringify(attachment)} points at ${path}, which does not have an image extension (${Object.keys(imageTypes).join(`, `)}). The bridge serves attachments only as images.`
      );
      return;
    }
    let bytes: Buffer;
    try {
      bytes = await readFile(path);
    } catch (error) {
      refuse(
        response,
        404,
        `The attachment ${JSON.stringify(attachment)} points at ${path}, which could not be read: ${reasonOf(error)}. Paths are resolved against ${cwd}, as \`render\` resolves them.`
      );
      return;
    }
    send(response, 200, request.method === `HEAD` ? Buffer.alloc(0) : bytes, {
      "Content-Type": contentType,
      // An SVG opened on its own would run any script in it on this origin. Sandboxed, it cannot.
      "Content-Security-Policy": `sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:`
    });
  };

  server.on(`request`, (request, response) => {
    const handle = async (): Promise<void> => {
      if (!hosts.has(request.headers.host ?? ``)) {
        refuse(
          response,
          403,
          `This request named the host ${JSON.stringify(request.headers.host ?? ``)}, but Studio answers only to its own address on the loopback interface. A request through another name is how a web page tries to reach a local server by DNS rebinding, so it is refused. Open the address the studio command printed.`
        );
        return;
      }
      const origin = request.headers.origin;
      if (origin !== undefined && !origins.has(origin)) {
        refuse(
          response,
          403,
          `This request came from ${origin}, which is not Studio. Another site cannot read or write the scene file through this server. Open Studio at the address the studio command printed.`
        );
        return;
      }
      const url = new URL(request.url ?? `/`, `http://${host}`);
      if (
        url.pathname.length === prefix.length - 1 &&
        hasSecret(`${url.pathname}/`)
      ) {
        // The address without its trailing slash: the app's relative URLs need it.
        send(response, 308, ``, { Location: prefix });
        return;
      }
      if (!hasSecret(url.pathname)) {
        refuse(
          response,
          403,
          `This is a discordkit-preview Studio server, and this address does not carry its secret. Every page and request needs the full address the studio command printed, which includes a secret that changes each run, so that other web pages cannot reach the scene file. Copy the address from the command's output.`
        );
        return;
      }
      const route = url.pathname.slice(prefix.length);
      if (
        route === bridgeRoutes.file ||
        route === bridgeRoutes.events ||
        route.startsWith(bridgeRoutes.attachments)
      ) {
        if (file === undefined) {
          refuse(
            response,
            404,
            `Studio was started without a file, so there is no scene file to read or write. It is keeping a draft in the browser instead. To edit a file, run \`discordkit-preview studio <scene.json>\`.`
          );
          return;
        }
        if (route === bridgeRoutes.file) {
          await serveFile(request, response);
        } else if (route === bridgeRoutes.events) {
          serveEvents(request, response);
        } else {
          await serveAttachment(
            request,
            response,
            route.slice(bridgeRoutes.attachments.length)
          );
        }
        return;
      }
      await serveStatic(request, response, route);
    };
    const answer = async (): Promise<void> => {
      try {
        await handle();
      } catch (error) {
        if (response.headersSent) {
          response.destroy();
          return;
        }
        refuse(
          response,
          500,
          `Studio's server failed while answering ${request.method ?? ``} ${request.url ?? ``}: ${reasonOf(error)}. This is probably a bug in @discordkit/preview; report it with what you were doing. Reloading the page usually recovers.`
        );
      }
    };
    void answer();
  });

  let listening: number;
  try {
    if (port === undefined) {
      try {
        listening = await listen(server, preferredPort);
      } catch (error) {
        if (codeOf(error) !== `EADDRINUSE`) throw error;
        listening = await listen(server, 0);
      }
    } else {
      listening = await listen(server, port);
    }
  } catch (error) {
    watcher?.close();
    throw new StudioServerError(
      codeOf(error) === `EADDRINUSE`
        ? `discordkit-preview studio could not listen on port ${String(port)}, because another program is using it. Pass another port with --port, or leave --port out to use any free one.`
        : `discordkit-preview studio could not start its server on ${host}: ${reasonOf(error)}. Pass another port with --port, or leave it out to use any free one.`,
      { cause: error }
    );
  }
  hosts = new Set([
    `${host}:${String(listening)}`,
    `localhost:${String(listening)}`
  ]);
  origins = new Set([...hosts].map((name) => `http://${name}`));

  // Keeps the change stream open through proxies and sleeping laptops, and lets the browser notice a dead one.
  const heartbeat = setInterval(() => {
    for (const client of clients) client.write(`: ping\n\n`);
  }, 20_000);
  heartbeat.unref();

  return {
    url: `http://${host}:${String(listening)}${prefix}`,
    port: listening,
    secret,
    close: async () => {
      watcher?.close();
      clearInterval(heartbeat);
      for (const client of clients) client.end();
      clients.clear();
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      });
    }
  };
};
