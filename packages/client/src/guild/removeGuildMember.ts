import * as v from "valibot";
import { remove, type Fetcher, snowflake } from "@discordkit/core";

export const removeGuildMemberSchema = v.object({
  guild: snowflake,
  user: snowflake
});

/**
 * ### [Remove Guild Member](https://discord.com/developers/docs/resources/guild#remove-guild-member)
 *
 * **DELETE** `/guilds/:guild/members/:user`
 *
 * Remove a member from a guild. Requires `KICK_MEMBERS` permission. Returns a `204 empty` response on success. Fires a Guild Member Remove Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const removeGuildMember: Fetcher<
  typeof removeGuildMemberSchema,
  void,
  { auditLogReason: true }
> = async ({ guild, user }, options) =>
  remove(`/guilds/${guild}/members/${user}`, options);
