import { z } from "zod";
import { remove, type Fetcher, createProcedure } from "../utils";

export const deleteGuildRoleSchema = z.object({
  guild: z.string().min(1),
  role: z.string().min(1)
});

/**
 * Delete a guild role. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on success. Fires a [Guild Role Delete](https://discord.com/developers/docs/topics/gateway#guild-role-delete) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#delete-guild-role
 */
export const deleteGuildRole: Fetcher<typeof deleteGuildRoleSchema> = async ({
  guild,
  role
}) => remove(`/guilds/${guild}/roles/${role}`);

export const deleteGuildRoleProcedure = createProcedure(
  `mutation`,
  deleteGuildRole,
  deleteGuildRoleSchema
);
