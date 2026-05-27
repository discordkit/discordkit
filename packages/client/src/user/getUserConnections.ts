import { get, type Fetcher } from "@discordkit/core";
import { type Connection } from "./types/Connection.js";

/**
 * ### [Get User Connections](https://discord.com/developers/docs/resources/user#get-user-connections)
 *
 * **GET** `/users/@me/connections`
 *
 * Returns a list of {@link Connection | connection objects}. Requires the `connections` OAuth2 scope.
 */
export const getUserConnections: Fetcher<null, Connection> = async () =>
  get(`/users/@me/connections`);
