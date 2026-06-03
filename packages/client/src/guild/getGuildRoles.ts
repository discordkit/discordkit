import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Role } from "../permissions/Role.js";

export const getGuildRolesSchema = v.object({
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
