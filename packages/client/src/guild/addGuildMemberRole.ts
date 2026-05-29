import * as v from "valibot";
import { put, type Fetcher, snowflake } from "@discordkit/core";

export const addGuildMemberRoleSchema = v.object({
  guild: snowflake,
  user: snowflake,
  role: snowflake
});

/**
 * ### [Add Guild Member Role](https://discord.com/developers/docs/resources/guild#add-guild-member-role)
 *
 * **PUT** `/guilds/:guild/members/:user/roles/:role`
 *
 * Adds a role to a guild member. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on success. Fires a Guild Member Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const addGuildMemberRole: Fetcher<
  typeof addGuildMemberRoleSchema,
  void,
  { auditLogReason: true }
> = async ({ guild, user, role }, options) =>
  put(`/guilds/${guild}/members/${user}/roles/${role}`, undefined, options);
