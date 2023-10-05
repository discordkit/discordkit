import { z } from "zod";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "./types/Role.js";

export const getGuildRolesSchema = z.object({
  guild: snowflake
});

/**
 * ### [Get Guild Roles](https://discord.com/developers/docs/resources/guild#get-guild-roles)
 *
 * **GET** `/guilds/:guild/roles`
 *
 * Returns a list of {@link Role | role objects} for the guild.
 */
export const getGuildRoles: Fetcher<
  typeof getGuildRolesSchema,
  Role[]
> = async ({ guild }) => get(`/guilds/${guild}/roles`);

export const getGuildRolesSafe = toValidated(
  getGuildRoles,
  getGuildRolesSchema,
  roleSchema.array()
);

export const getGuildRolesProcedure = toProcedure(
  `query`,
  getGuildRoles,
  getGuildRolesSchema,
  roleSchema.array()
);

export const getGuildRolesQuery = toQuery(getGuildRoles);
