import { discord } from "./DiscordSession.js";
import { toCamelKeys } from "../utils/toCamelKeys.js";
import { toSnakeKeys } from "../utils/toSnakeKeys.js";
import {
  shouldSerializeAsMultipart,
  toMultipartBody
} from "../validations/fileUpload.js";

export type RequestBody = object | null | undefined;

export const request = async <T>(
  resource: URL,
  method = `GET`,
  body?: RequestBody
): Promise<T> => {
  const token = discord.getSession();

  if (!token) {
    throw new Error(`Auth Token must be set before requests can be made.`);
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
  const res = await discord.queueRequest(resource, method, serializeBody());

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
