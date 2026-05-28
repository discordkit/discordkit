import * as v from "valibot";
import { get, type Fetcher, snowflake } from "@discordkit/core";

export const getGuildRoleMemberCountsSchema = v.object({
  guild: snowflake
});

/**
 * ### [Get Guild Role Member Counts](https://discord.com/developers/docs/resources/guild#get-guild-role-member-counts)
 *
 * **GET** `/guilds/:guild/roles/member-counts`
 *
 * Returns a map of role IDs to the number of members with the role. Does not include the `@everyone` role.
 *
 * @example
 * ```json
 * {
 *   "613425648685547541": 1337,
 *   "1409696176629878905": 2,
 *   "697138785317814292": 67
 * }
 * ```
 */
export const getGuildRoleMemberCounts: Fetcher<
  typeof getGuildRoleMemberCountsSchema,
  Record<string, number>
> = async ({ guild }) => get(`/guilds/${guild}/roles/member-counts`);
