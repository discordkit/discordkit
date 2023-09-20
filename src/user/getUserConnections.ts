import { get, type Fetcher, createProcedure } from "../utils";
import { connectionSchema, type Connection } from "./types";

/**
 * Returns a list of connection objects. Requires the `connections` OAuth2 scope.
 *
 * https://discord.com/developers/docs/resources/user#get-user-connections
 */
export const getUserConnections: Fetcher<null, Connection> = async () =>
  get(`/users/@me/connections`);

export const getUserConnectionsProcedure = createProcedure(
  `query`,
  getUserConnections,
  null,
  connectionSchema
);
