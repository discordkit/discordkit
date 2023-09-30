import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated
} from "#/utils/index.ts";
import { connectionSchema, type Connection } from "./types/Connection.ts";

/**
 * ### [Get User Connections](https://discord.com/developers/docs/resources/user#get-user-connections)
 *
 * **GET** `/users/@me/connections`
 *
 * Returns a list of {@link Connection | connection objects}. Requires the `connections` OAuth2 scope.
 */
export const getUserConnections: Fetcher<null, Connection> = async () =>
  get(`/users/@me/connections`);

export const getUserConnectionsSafe = toValidated(
  getUserConnections,
  null,
  connectionSchema
);

export const getUserConnectionsProcedure = toProcedure(
  `query`,
  getUserConnections,
  null,
  connectionSchema
);

export const getUserConnectionsQuery = toQuery(getUserConnections);
