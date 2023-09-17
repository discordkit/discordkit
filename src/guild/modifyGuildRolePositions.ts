import { z } from "zod";
import { mutation, patch } from "../utils";
import type { Role } from "./types";

export const modifyGuildRolePositionsSchema = z.object({
  guild: z.string().min(1),
  body: z.array(
    z.object({
      /** role */
      id: z.string().min(1),
      /** sorting position of the role */
      position: z.number().positive().nullable()
    })
  )
});

/**
 * Modify the positions of a set of role objects for the guild. Requires the `MANAGE_ROLES` permission. Returns a list of all of the guild's role objects on success. Fires multiple [Guild Role Update](https://discord.com/developers/docs/topics/gateway#guild-role-update) Gateway events.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-role-positions
 */
export const modifyGuildRolePositions = mutation(
  modifyGuildRolePositionsSchema,
  async ({ guild, body }) => patch<Role[]>(`/guilds/${guild}/roles`, body)
);
