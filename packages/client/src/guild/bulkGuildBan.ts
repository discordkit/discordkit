import * as v from "valibot";
import { post, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const bulkGuildBanSchema = v.object({
  guild: snowflake,
  body: v.object({
    /** list of user ids to ban (max 200) */
    userIds: v.pipe(v.array(snowflake), v.nonEmpty(), v.maxLength(200)),
    /** number of seconds to delete messages for, between 0 and 604800 (7 days) */
    deleteMessageSeconds: v.pipe(
      v.number(),
      v.integer(),
      v.minValue(0),
      v.maxValue(604800)
    )
  })
});

/**
 * ### [Bulk Guild Ban](https://discord.com/developers/docs/resources/guild#bulk-guild-ban)
 *
 * **POST** `/guilds/:guild/bulk-ban`
 *
 * Ban up to 200 users from a guild, and optionally delete previous messages sent by the banned users. Requires both the `BAN_MEMBERS` and `MANAGE_GUILD` permissions. Returns a 200 response on success, including the fields `bannedUsers` with the IDs of the banned users and `failedUsers` with IDs that could not be banned or were already banned.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * > [!NOTE]
 * >
 * > If none of the users could be banned, an error response code `500000: Failed to ban users` is returned instead.
 */
export const bulkGuildBan: Fetcher<
  typeof bulkGuildBanSchema,
  { bannedUsers: string[]; failedUsers: string[] },
  { auditLogReason: true }
> = async ({ guild, body }, options) =>
  post(`/guilds/${guild}/bulk-ban`, body, options);
