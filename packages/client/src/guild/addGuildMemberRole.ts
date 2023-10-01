import { z } from "zod";
import { put, type Fetcher, toProcedure, toValidated } from "@discordkit/core";

export const addGuildMemberRoleSchema = z.object({
  guild: z.string().min(1),
  user: z.string().min(1),
  role: z.string().min(1)
});

/**
 * ### [Add Guild Member Role](https://discord.com/developers/docs/resources/guild#add-guild-member-role)
 *
 * **PUT** `/guilds/:guild/members/:user/roles/:role`
 *
 * Adds a role to a guild member. Requires the `MANAGE_ROLES` permission. Returns a `204 empty` response on success. Fires a Guild Member Update Gateway event
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const addGuildMemberRole: Fetcher<
  typeof addGuildMemberRoleSchema
> = async ({ guild, user, role }) =>
  put(`/guilds/${guild}/members/${user}/roles/${role}`);

export const addGuildMemberRoleSafe = toValidated(
  addGuildMemberRole,
  addGuildMemberRoleSchema
);

export const addGuildMemberRoleProcedure = toProcedure(
  `mutation`,
  addGuildMemberRole,
  addGuildMemberRoleSchema
);
