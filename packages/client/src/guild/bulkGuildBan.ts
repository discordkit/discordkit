import {
  array,
  integer,
  maxLength,
  maxValue,
  minValue,
  nonEmpty,
  number,
  object,
  pipe
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const bulkGuildBanSchema = object({
  guild: snowflake,
  body: object({
    /** list of user ids to ban (max 200) */
    userIds: pipe(array(snowflake), nonEmpty(), maxLength(200)),
    /** number of seconds to delete messages for, between 0 and 604800 (7 days) */
    deleteMessageSeconds: pipe(
      number(),
      integer(),
      minValue(0),
      maxValue(604800)
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
 */
export const bulkGuildBan: Fetcher<
  typeof bulkGuildBanSchema,
  { bannedUsers: string[]; failedUsers: string[] }
> = async ({ guild, body }) => post(`/guilds/${guild}/bulk-ban`, body);

export const bulkGuildBanSafe = toValidated(
  bulkGuildBan,
  bulkGuildBanSchema,
  object({
    bannedUsers: array(snowflake),
    failedUsers: array(snowflake)
  })
);

export const bulkGuildBanProcedure = toProcedure(
  `mutation`,
  bulkGuildBan,
  bulkGuildBanSchema,
  object({
    bannedUsers: array(snowflake),
    failedUsers: array(snowflake)
  })
);
