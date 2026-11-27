/**
 * Sends requests to Discord's HTTP API for the calibration kit: authorises them, uploads files as multipart, waits as Discord's rate-limit headers say, and stops on the first answer it does not expect, saying what Discord answered and to which request, never with the token.
 *
 * `fetch` and the clock are passed in, so the specs can stand a local server in for Discord.
 */
import { setTimeout as delay } from "node:timers/promises";

export const discordApi = `https://discord.com/api/v10`;

/** What Discord asks of a client's User-Agent: the library's address and version. Names nothing about the person running it. */
const userAgent = `DiscordBot (https://github.com/discordkit/discordkit, 0.0.0) calibration-kit`;

/** How many times one request is retried after a 429 before giving up. */
const maxRateLimitRetries = 5;

/** The shortest wait after a 429, so a malformed `retry_after` cannot make a tight loop. */
const minimumRetryWait = 250;

export interface Credentials {
  /** A bot token, sent as `Authorization: Bot …`. */
  botToken: string | null;
  /** A webhook, parsed from its URL. */
  webhook: { id: string; token: string } | null;
}

export interface OutgoingFile {
  name: string;
  bytes: Uint8Array;
}

export interface OutgoingRequest {
  method: `GET` | `POST` | `PATCH` | `DELETE`;
  /** Under the API base, with ids filled in, such as `/channels/123/messages`. `{webhook}` stands for the webhook's id and token, filled in here so nothing else holds the token. */
  path: string;
  query?: Record<string, string>;
  /** Whether to authorise it with the bot token. A webhook request carries its own token in its path. */
  auth: boolean;
  body?: Record<string, unknown>;
  files?: readonly OutgoingFile[];
  /** What it is for, in a few words, for an error message: "F07, message 2". */
  purpose: string;
}

export interface DiscordClientOptions {
  credentials: Credentials;
  fetch?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  /** The API's base. Only the specs change it. */
  base?: string;
  /** Told when the client waits, with the reason. */
  onWait?: (ms: number, reason: string) => void;
}

/** Thrown for any answer the kit does not expect. Its message says what Discord answered and the request that caused it, with tokens removed. */
export class DiscordResponseError extends Error {
  readonly status: number;
  readonly discordBody: unknown;
  constructor(message: string, status: number, discordBody: unknown) {
    super(message);
    this.name = `DiscordResponseError`;
    this.status = status;
    this.discordBody = discordBody;
  }
}

const webhookPattern =
  /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d+)\/([\w-]+)\/?$/;

/**
 * Reads a webhook URL as Discord's "Copy Webhook URL" writes it. Throws, saying what a valid one looks like and never repeating the value, for anything else.
 */
export const parseWebhookUrl = (url: string): { id: string; token: string } => {
  const match = webhookPattern.exec(url.trim());
  if (!match) {
    throw new Error(
      `DISCORD_CALIBRATION_WEBHOOK_URL is set, but it is not a Discord webhook URL, so the kit cannot post the labels with it. A webhook URL looks like https://discord.com/api/webhooks/<id>/<token>. In the test channel's settings, open Integrations, then Webhooks, choose the webhook and press "Copy Webhook URL", and set the variable to exactly that.`
    );
  }
  return { id: match[1], token: match[2] };
};

/** A path or URL with any webhook token, and anything that looks like a bot token, replaced, for printing. */
export const redact = (text: string, credentials: Credentials): string => {
  let safe = text;
  if (credentials.webhook) {
    safe = safe.replaceAll(credentials.webhook.token, `<webhook token>`);
  }
  if (credentials.botToken) {
    safe = safe.replaceAll(credentials.botToken, `<bot token>`);
  }
  return safe;
};

const wait = async (ms: number): Promise<void> => {
  await delay(ms);
};

const seconds = (value: string | null): number | null => {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

/** The route a rate limit applies to: the method and the path with ids other than the channel's or webhook's turned into a placeholder, as Discord's buckets are keyed. */
const routeKey = (method: string, path: string): string =>
  `${method} ${path.replace(/\/messages\/\d+/, `/messages/:id`)}`;

export interface DiscordClient {
  send: (request: OutgoingRequest) => Promise<unknown>;
}

/**
 * A client that sends one request at a time. After each answer it reads `X-RateLimit-Remaining` and `X-RateLimit-Reset-After`, and before the next request to a route that has none left it waits until the reset. A 429 is waited out for as long as Discord says (`retry_after`, or the `Retry-After` header), then retried, at most five times. Any other answer outside 2xx throws a `DiscordResponseError`.
 */
export const createDiscordClient = (
  options: DiscordClientOptions
): DiscordClient => {
  const { credentials } = options;
  const doFetch = options.fetch ?? fetch;
  const sleep = options.sleep ?? wait;
  const base = options.base ?? discordApi;
  /** When each route may next be called, in ms since the epoch. */
  const resumeAt = new Map<string, number>();
  let globalResumeAt = 0;

  const pause = async (ms: number, reason: string): Promise<void> => {
    if (ms <= 0) return;
    options.onWait?.(ms, reason);
    await sleep(ms);
  };

  const describe = (request: OutgoingRequest, url: string): string => {
    const lines = [`  ${request.method} ${redact(url, credentials)}`];
    if (request.body) {
      lines.push(
        `  body: ${redact(JSON.stringify(request.body), credentials)}`
      );
    }
    if (request.files && request.files.length > 0) {
      lines.push(
        `  files: ${request.files.map((file) => `${file.name} (${String(file.bytes.length)} bytes)`).join(`, `)}`
      );
    }
    return lines.join(`\n`);
  };

  const send = async (request: OutgoingRequest): Promise<unknown> => {
    if (request.auth && !credentials.botToken) {
      throw new Error(
        `The kit tried to send ${request.method} ${request.path} (${request.purpose}) with the bot's token, but none is set. This is a bug in scripts/calibration: the plan should not include bot requests without a token.`
      );
    }
    let path = request.path;
    if (path.includes(`{webhook}`)) {
      if (!credentials.webhook) {
        throw new Error(
          `The kit tried to send ${request.method} ${request.path} (${request.purpose}) through the webhook, but no webhook URL is set. This is a bug in scripts/calibration: the plan should not include webhook requests without one.`
        );
      }
      path = path.replace(
        `{webhook}`,
        `${credentials.webhook.id}/${credentials.webhook.token}`
      );
    }
    const query = new URLSearchParams(request.query ?? {}).toString();
    const url = `${base}${path}${query === `` ? `` : `?${query}`}`;
    const key = routeKey(request.method, request.path);

    for (let attempt = 0; ; attempt += 1) {
      const now = Date.now();
      await pause(globalResumeAt - now, `Discord's global rate limit`);
      await pause(
        (resumeAt.get(key) ?? 0) - Date.now(),
        `the rate limit on ${key}`
      );

      const headers: Record<string, string> = { "User-Agent": userAgent };
      if (request.auth && credentials.botToken) {
        headers.Authorization = `Bot ${credentials.botToken}`;
      }
      let body: string | FormData | undefined;
      if (request.files && request.files.length > 0) {
        const form = new FormData();
        form.append(`payload_json`, JSON.stringify(request.body ?? {}));
        request.files.forEach((file, index) => {
          form.append(
            `files[${String(index)}]`,
            new Blob([Uint8Array.from(file.bytes)]),
            file.name
          );
        });
        body = form;
      } else if (request.body) {
        headers[`Content-Type`] = `application/json`;
        body = JSON.stringify(request.body);
      }

      const response = await doFetch(url, {
        method: request.method,
        headers,
        body
      });
      const remaining = response.headers.get(`x-ratelimit-remaining`);
      const resetAfter = seconds(
        response.headers.get(`x-ratelimit-reset-after`)
      );
      if (remaining === `0` && resetAfter !== null) {
        resumeAt.set(key, Date.now() + resetAfter * 1000);
      }

      const text = await response.text();
      let parsed: unknown = text;
      try {
        parsed = text === `` ? null : JSON.parse(text);
      } catch {
        // Not JSON: keep the text, which the error prints as it is.
      }

      if (response.status === 429) {
        const record =
          typeof parsed === `object` && parsed !== null
            ? (parsed as Record<string, unknown>)
            : {};
        const after =
          (typeof record.retry_after === `number`
            ? record.retry_after
            : null) ??
          seconds(response.headers.get(`retry-after`)) ??
          1;
        const ms = Math.max(minimumRetryWait, Math.ceil(after * 1000));
        if (attempt >= maxRateLimitRetries) {
          throw new DiscordResponseError(
            `Discord kept answering 429 Too Many Requests to ${request.purpose}, ${String(maxRateLimitRetries + 1)} times in a row, so the kit stopped rather than keep asking. The request:\n${describe(request, url)}\nDiscord's last answer: ${redact(text, credentials)}\nWait a few minutes for the limit to pass, then run the command again with --only, starting from the fixture that failed.`,
            429,
            parsed
          );
        }
        if (
          record.global === true ||
          response.headers.get(`x-ratelimit-global`) === `true`
        ) {
          globalResumeAt = Date.now() + ms;
        } else {
          resumeAt.set(key, Date.now() + ms);
        }
        continue;
      }

      if (response.status < 200 || response.status >= 300) {
        throw new DiscordResponseError(
          `Discord answered ${String(response.status)} ${response.statusText} to ${request.purpose}, which the kit did not expect, so it stopped there and sent nothing after it. The request:\n${describe(request, url)}\nDiscord's answer: ${redact(text, credentials)}\nDiscord's answer says what it refused; fix that in the fixture or the settings it names, then run the command again with --only, starting from the fixture that failed.`,
          response.status,
          parsed
        );
      }
      return parsed;
    }
  };

  return { send };
};
