import * as v from "valibot";
import { remove, type Fetcher, snowflake } from "@discordkit/core";

export const removeGuildBanSchema = v.object({
  guild: snowflake,
  user: snowflake
});

/**
 * ### [Remove Guild Ban](https://discord.com/developers/docs/resources/guild#remove-guild-ban)
 *
 * **DELETE** `/guilds/:guild/bans/:user`
 *
 * Remove the ban for a user. Requires the BAN_MEMBERS permissions. Returns a `204 empty` response on success. Fires a Guild Ban Remove Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const removeGuildBan: Fetcher<
  typeof removeGuildBanSchema,
  void,
  { auditLogReason: true }
> = async ({ guild, user }, options) =>
  remove(`/guilds/${guild}/bans/${user}`, options);
