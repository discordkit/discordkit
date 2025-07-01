import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "../permissions/Role.js";

export const getGuildRoleSchema = v.object({
  guild: snowflake,
  role: snowflake
});

/**
 * ### [Get Guild Role](https://discord.com/developers/docs/resources/guild#get-guild-role)
 *
 * **GET** `/guilds/:guild/roles/:role`
 *
 * Returns a {@link Role | role object} for the specified role.
 */
export const getGuildRole: Fetcher<typeof getGuildRoleSchema, Role> = async ({
  guild,
  role
}) => get(`/guilds/${guild}/roles/${role}`);

export const getGuildRoleSafe = toValidated(
  getGuildRole,
  getGuildRoleSchema,
  roleSchema
);

export const getGuildRoleProcedure = toProcedure(
  `query`,
  getGuildRole,
  getGuildRoleSchema,
  roleSchema
);

export const getGuildRoleQuery = toQuery(getGuildRole);
