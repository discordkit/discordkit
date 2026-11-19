import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import type { ComputedPermissions } from "../permissions/ComputedPermissions.js";

export const getGuildMemberPermissionsSchema = v.object({
  guild: snowflake,
  user: snowflake
});

/**
 * ### [Get Guild Member Permissions](https://discord.com/developers/docs/resources/guild#get-guild-member-permissions)
 *
 * **GET** `/guilds/:guild/permissions/member/:user`
 *
 * Returns the member's {@link ComputedPermissions | computed guild permissions}, combining their roles with `@everyone`.
 */
export const getGuildMemberPermissions: Fetcher<
  typeof getGuildMemberPermissionsSchema,
  ComputedPermissions
> = async ({ guild, user }) =>
  get(`/guilds/${guild}/permissions/member/${user}`);
