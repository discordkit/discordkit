import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { roleSchema, type Role } from "./types/Role";

export const modifyGuildRolePositionsSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** role */
      id: z.string().min(1),
      /** sorting position of the role */
      position: z.number().int().positive().nullable().optional()
    })
    .array()
});

/**
 * ### [Modify Guild Role Positions](https://discord.com/developers/docs/resources/guild#modify-guild-role-positions)
 *
 * **PATCH** `/guilds/:guild/roles`
 *
 * Modify the positions of a set of role objects for the guild. Requires the `MANAGE_ROLES` permission. Returns a list of all of the guild's {@link Role | role objects} on success. Fires multiple Guild Role Update Gateway events.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildRolePositions: Fetcher<
  typeof modifyGuildRolePositionsSchema,
  Role[]
> = async ({ guild, body }) => patch(`/guilds/${guild}/roles`, body);

export const modifyGuildRolePositionsProcedure = toProcedure(
  `mutation`,
  modifyGuildRolePositions,
  modifyGuildRolePositionsSchema,
  roleSchema.array()
);
