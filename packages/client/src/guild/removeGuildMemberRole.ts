import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const removeGuildMemberRoleSchema = v.object({
  guild: snowflake,
  user: snowflake,
  role: snowflake
});

/**
 * ### [Remove Guild Member Role](https://discord.com/developers/docs/resources/guild#remove-guild-member-role)
 *
 * **DELETE** `/guilds/:guild/members/:user/roles/:role`
 *
 * Removes a role from a guild member. Requires the `MANAGE_ROLES` permission. Returns a `204 empty` response on success. Fires a Guild Member Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const removeGuildMemberRole: Fetcher<
  typeof removeGuildMemberRoleSchema
> = async ({ guild, user, role }) =>
  remove(`/guilds/${guild}/members/${user}/roles/${role}`);

export const removeGuildMemberRoleSafe = toValidated(
  removeGuildMemberRole,
  removeGuildMemberRoleSchema
);

export const removeGuildMemberRoleProcedure = toProcedure(
  `mutation`,
  removeGuildMemberRole,
  removeGuildMemberRoleSchema
);
