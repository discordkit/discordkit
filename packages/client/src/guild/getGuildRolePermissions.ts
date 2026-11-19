import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ComputedPermissions } from "../permissions/ComputedPermissions.js";

export const getGuildRolePermissionsSchema = v.object({
  guild: snowflake,
  role: snowflake
});

/**
 * ### [Get Guild Role Permissions](https://discord.com/developers/docs/resources/guild#get-guild-role-permissions)
 *
 * **GET** `/guilds/:guild/permissions/role/:role`
 *
 * Returns the {@link ComputedPermissions | combined guild permissions} of the specified role and `@everyone`. This calculation does not include other roles or member-specific restrictions.
 */
export const getGuildRolePermissions: Fetcher<
  typeof getGuildRolePermissionsSchema,
  ComputedPermissions
> = async ({ guild, role }) => get(`/guilds/${guild}/permissions/role/${role}`);
