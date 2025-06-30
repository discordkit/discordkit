import { discord } from "./DiscordSession.js";
import { toCamelKeys } from "../utils/toCamelKeys.js";
import { toSnakeKeys } from "../utils/toSnakeKeys.js";

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

  const res = await fetch(resource.toString(), {
    method,
    body: body ? JSON.stringify(toSnakeKeys(body)) : body,
    headers: {
      Authorization: token
    }
  });

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
