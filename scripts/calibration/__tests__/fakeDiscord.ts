/**
 * A local HTTP server standing in for Discord's API, for the calibration kit's specs. It answers the few routes the kit uses the way Discord documents them, records every request as it arrived (headers, JSON or multipart body), and lets a spec queue a different answer for the next request to a route, such as a 429 or a 400.
 */
import { once } from "node:events";
import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";

export interface RecordedFile {
  field: string;
  name: string;
  bytes: Uint8Array;
}

export interface RecordedRequest {
  method: string;
  /** The path under `/api/v10`, without the query. */
  path: string;
  query: URLSearchParams;
  headers: IncomingMessage[`headers`];
  /** The JSON body, or a multipart request's `payload_json`. */
  json: unknown;
  files: RecordedFile[];
}

export interface FakeAnswer {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface FakeDiscord {
  /** The API base to give the kit's client. */
  base: string;
  requests: RecordedRequest[];
  /** Answers the next request whose `METHOD path` matches with `answer` instead of the usual one. */
  queue: (method: string, path: RegExp, answer: FakeAnswer) => void;
  close: () => Promise<void>;
}

export const fakeIds = {
  bot: `900000000000000001`,
  guild: `800000000000000001`,
  channel: `700000000000000001`,
  webhook: `600000000000000001`,
  webhookToken: `fake-webhook-token-abc`,
  botToken: `fake.bot-token.xyz`
};

const readBody = async (request: IncomingMessage): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
};

/** Parses a body the way the kit sent it: JSON, or multipart with `payload_json` and `files[n]`. */
const parseBody = async (
  request: IncomingMessage,
  raw: Buffer
): Promise<{ json: unknown; files: RecordedFile[] }> => {
  const type = request.headers[`content-type`] ?? ``;
  if (type.startsWith(`multipart/form-data`)) {
    const form = await new Request(`http://local/`, {
      method: `POST`,
      headers: { "content-type": type },
      body: new Uint8Array(raw)
    }).formData();
    const files: RecordedFile[] = [];
    let json: unknown = null;
    for (const [field, value] of form.entries()) {
      if (typeof value === `string`) {
        if (field === `payload_json`) json = JSON.parse(value);
      } else {
        files.push({
          field,
          name: value.name,
          bytes: new Uint8Array(await value.arrayBuffer())
        });
      }
    }
    return { json, files };
  }
  return {
    json: raw.length === 0 ? null : JSON.parse(raw.toString(`utf8`)),
    files: []
  };
};

/** Starts the stand-in on a free port on 127.0.0.1. */
export const startFakeDiscord = async (): Promise<FakeDiscord> => {
  const requests: RecordedRequest[] = [];
  const queued: { method: string; path: RegExp; answer: FakeAnswer }[] = [];
  let nextMessage = 500_000_000_000_000_001n;

  const usual = (method: string, path: string): FakeAnswer => {
    if (method === `GET` && path === `/users/@me`) {
      return {
        status: 200,
        body: { id: fakeIds.bot, username: `calibration-bot`, bot: true }
      };
    }
    if (method === `GET` && path.startsWith(`/channels/`)) {
      return {
        status: 200,
        body: { id: path.split(`/`)[2], guild_id: fakeIds.guild, type: 0 }
      };
    }
    if (method === `GET` && path.startsWith(`/webhooks/`)) {
      return {
        status: 200,
        body: { id: fakeIds.webhook, channel_id: fakeIds.channel, type: 1 }
      };
    }
    if (method === `POST` || method === `PATCH`) {
      const id =
        method === `PATCH`
          ? (path.split(`/`).at(-1) ?? ``)
          : String(nextMessage++);
      return { status: 200, body: { id, channel_id: fakeIds.channel } };
    }
    if (method === `DELETE`) return { status: 204 };
    return { status: 404, body: { message: `404: Not Found`, code: 0 } };
  };

  const server: Server = createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? `/`, `http://local`);
      const path = url.pathname.replace(/^\/api\/v10/, ``);
      const method = request.method ?? `GET`;
      const { json, files } = await parseBody(request, await readBody(request));
      requests.push({
        method,
        path,
        query: url.searchParams,
        headers: request.headers,
        json,
        files
      });
      const index = queued.findIndex(
        (entry) => entry.method === method && entry.path.test(path)
      );
      const answer =
        index === -1 ? usual(method, path) : queued.splice(index, 1)[0].answer;
      response.writeHead(answer.status, {
        "content-type": `application/json`,
        ...answer.headers
      });
      response.end(
        answer.body === undefined ? `` : JSON.stringify(answer.body)
      );
    })();
  });
  await new Promise<void>((resolve) => {
    server.listen(0, `127.0.0.1`, resolve);
  });
  const { port } = server.address() as AddressInfo;
  return {
    base: `http://127.0.0.1:${String(port)}/api/v10`,
    requests,
    queue: (method, path, answer) => {
      queued.push({ method, path, answer });
    },
    close: async () => {
      const closed = once(server, `close`);
      server.close();
      await closed;
    }
  };
};
