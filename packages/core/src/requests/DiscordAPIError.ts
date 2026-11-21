import { isObject } from "../utils/isObject.js";

/**
 * The URL as text, with the webhook or interaction token in its path replaced by `<token>`.
 *
 * Webhook and interaction routes put a token in the path (`/webhooks/{id}/{token}`, `/interactions/{id}/{token}/callback`). That segment is a credential: anyone who reads it can post as the bot until it expires. Use this wherever a URL ends up in an error or a log.
 */
export const redactToken = (resource: URL): string =>
  `${resource.origin}${resource.pathname.replace(
    /^((?:\/api(?:\/v\d+)?)?\/(?:webhooks|interactions)\/[^/]+\/)[^/]+/,
    `$1<token>`
  )}${resource.search}`;

/**
 * Thrown when Discord answers a request with an error status.
 *
 * Carries the HTTP status and, when Discord sent its JSON error body, the error code and message. Callers can then tell a missing permission (`50013`) from an expired interaction (`10062`) without parsing text. The codes are listed at https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
 *
 * The URL in the message has its token removed (see {@link redactToken}).
 */
export class DiscordAPIError extends Error {
  /** The HTTP status code of Discord's response. */
  readonly status: number;
  /** Discord's JSON error code, such as `50013` (Missing Permissions). `undefined` when the body had none. */
  readonly code: number | undefined;
  /** Discord's description of the error, such as `"Missing Permissions"`. `undefined` when the body had none. */
  readonly discordMessage: string | undefined;

  constructor(
    resource: URL,
    response: Pick<Response, `status` | `statusText`>,
    body: unknown
  ) {
    const code =
      isObject(body) && typeof body.code === `number` ? body.code : undefined;
    const discordMessage =
      isObject(body) && typeof body.message === `string`
        ? body.message
        : undefined;
    // `statusText` is empty over HTTP/2, so it cannot be the only detail.
    const statusLine = [response.status, response.statusText]
      .filter(Boolean)
      .join(` `);
    const detail = [
      discordMessage,
      code === undefined ? undefined : `(code ${code})`
    ]
      .filter(Boolean)
      .join(` `);

    super(
      `Request to resource '${redactToken(resource)}' failed:\n\n${detail ? `${statusLine}: ${detail}` : statusLine}`
    );
    this.name = `DiscordAPIError`;
    this.status = response.status;
    this.code = code;
    this.discordMessage = discordMessage;
  }
}
