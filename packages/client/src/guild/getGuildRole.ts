import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { type Role } from "../permissions/Role.js";

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
