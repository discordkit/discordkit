import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { roleSchema, type Role } from "./types/Role";

export const getGuildRolesSchema = z.object({
  guild: z.string().min(1)
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

export const getGuildRolesProcedure = toProcedure(
  `query`,
  getGuildRoles,
  getGuildRolesSchema,
  roleSchema.array()
);

export const getGuildRolesQuery = toQuery(getGuildRoles);
