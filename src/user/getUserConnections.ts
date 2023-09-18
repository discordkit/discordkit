import type { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Connection } from "./types";

/**
 * Returns a list of connection objects. Requires the `connections` OAuth2 scope.
 *
 * https://discord.com/developers/docs/resources/user#get-user-connections
 */
export const getUserConnections: Fetcher<z.ZodUnknown, Connection> = async () =>
  get(`/users/@me/connections`);
