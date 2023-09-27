import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const removeGuildMemberRoleSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  role: z.string().min(1)
});

/**
 * ### [Remove Guild Member Role](https://discord.com/developers/docs/resources/guild#remove-guild-member-role)
 *
 * **DELETE** `/guilds/:guild/members/:user/roles/:role`
 *
 * Removes a role from a guild member. Requires the `MANAGE_ROLES` permission. Returns a `204 empty` response on success. Fires a Guild Member Update Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const removeGuildMemberRole: Fetcher<
  typeof removeGuildMemberRoleSchema
> = async ({ guild, user, role }) =>
  remove(`/guilds/${guild}/members/${user}/roles/${role}`);

export const removeGuildMemberRoleProcedure = toProcedure(
  `mutation`,
  removeGuildMemberRole,
  removeGuildMemberRoleSchema
);
