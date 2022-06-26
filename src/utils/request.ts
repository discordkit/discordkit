import { toCamelKeys } from "./toCamelKeys";
import { toSnakeKeys } from "./toSnakeKeys"
import { discord } from "../DiscordSession";

export type RequestBody = object | null | undefined;

export const request = async <T>(resource: URL, method = `GET`, body?: RequestBody): Promise<T> => {
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
    throw new Error(`Request to resource '${resource.toString()}' failed:\n\n${res.statusText}`);
  }

  return toCamelKeys(await res.json());
};
