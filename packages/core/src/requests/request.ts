import { discord } from "./DiscordSession.js";
import { toCamelKeys } from "../utils/toCamelKeys.js";
import { toSnakeKeys } from "../utils/toSnakeKeys.js";
import {
  shouldSerializeAsMultipart,
  toMultipartBody
} from "../validations/fileUpload.js";

export type RequestBody = object | null | undefined;

/**
 * Per-call request options forwarded by the typed method helpers
 * (`get`/`post`/`put`/`patch`/`remove`) into the request layer.
 *
 * Endpoints surface these via the `Fetcher` type so the call site is
 * type-checked against the endpoint's declared capabilities.
 */
export interface RequestOptions {
  /**
   * Skip the `Authorization` header for this request. Used by webhook
   * and interaction endpoints whose path tokens act as authorization.
   * When set, `discord.getSession()` is NOT consulted, so the session
   * is allowed to be unset.
   */
  anonymous?: boolean;
  /**
   * Audit-log reason. Forwarded to Discord as the `X-Audit-Log-Reason`
   * header. The value is URL-encoded by the request layer so non-ASCII
   * characters survive transit.
   */
  reason?: string;
}

export const request = async <T>(
  resource: URL,
  method = `GET`,
  body?: RequestBody,
  options?: RequestOptions
): Promise<T> => {
  // For anonymous endpoints the session is optional — webhook and
  // interaction tokens travel in the URL, not the Authorization header.
  if (!options?.anonymous) {
    discord.getSession();
  }

  /**
   * Serialize the body. The `multipart()` schema wrapper stamps a
   * sentinel on the parsed body when {@link FileUpload}s are present,
   * which switches serialization from JSON to `multipart/form-data`.
   */
  const serializeBody = (): string | FormData | null | undefined => {
    if (!body) return body;
    try {
      if (shouldSerializeAsMultipart(body)) {
        return toMultipartBody(body, toSnakeKeys);
      }
      return JSON.stringify(toSnakeKeys(body));
    } catch (cause) {
      console.error(`Received malformed request body:\n\n`, { body });
      throw new Error(`Failed to serialize request body!`, { cause });
    }
  };

  // Queue the request through the rate limiter
  const res = await discord.queueRequest(
    resource,
    method,
    serializeBody(),
    options
  );

  if (!res.ok) {
    throw new Error(
      `Request to resource '${resource.toString()}' failed:\n\n${
        res.statusText
      }`
    );
  }

  // Return `void` on `204 No Content` responses
  if (res.status === 204) {
    // @ts-expect-error
    return;
  }

  return toCamelKeys(await res.json());
};
