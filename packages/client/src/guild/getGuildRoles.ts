import { array, object } from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "../permissions/Role.js";

export const getGuildRolesSchema = object({
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
  array(roleSchema)
);

export const getGuildRolesProcedure = toProcedure(
  `query`,
  getGuildRoles,
  getGuildRolesSchema,
  array(roleSchema)
);

export const getGuildRolesQuery = toQuery(getGuildRoles);
