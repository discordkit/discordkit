import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { type Connection } from "./types/Connection.js";

/**
 * ### [Get Current User Connections](https://discord.com/developers/docs/resources/user#get-current-user-connections)
 *
 * **GET** `/users/@me/connections`
 *
 * Returns a list of {@link Connection | connection objects}. Requires the `connections` OAuth2 scope.
 */
export const getCurrentUserConnections: Fetcher<
  null,
  Connection[]
> = async () => get(`/users/@me/connections`);
