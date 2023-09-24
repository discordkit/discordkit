import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { connectionSchema, type Connection } from "./types/Connection";

/**
 * Returns a list of connection objects. Requires the `connections` OAuth2 scope.
 *
 * https://discord.com/developers/docs/resources/user#get-user-connections
 */
export const getUserConnections: Fetcher<null, Connection> = async () =>
  get(`/users/@me/connections`);

export const getUserConnectionsProcedure = toProcedure(
  `query`,
  getUserConnections,
  null,
  connectionSchema
);

export const getUserConnectionsQuery = toQuery(getUserConnections);
