import * as v from "valibot";
import { patch, type Fetcher, snowflake } from "@discordkit/core";
import { type Role } from "../permissions/Role.js";

export const modifyGuildRolePositionsSchema = v.object({
  guild: snowflake,
  body: v.array(
    v.object({
      /** role */
      id: snowflake,
      /** sorting position of the role */
      position: v.nullish(v.pipe(v.number(), v.integer(), v.minValue(0)))
    })
  )
});

/**
 * ### [Modify Guild Role Positions](https://discord.com/developers/docs/resources/guild#modify-guild-role-positions)
 *
 * **PATCH** `/guilds/:guild/roles`
 *
 * Modify the positions of a set of {@link Role | role objects} for the guild. Requires the `MANAGE_ROLES` permission. Returns a list of all of the guild's {@link Role | role objects} on success. Fires multiple Guild Role Update Gateway events.
 *
 * This endpoint takes a JSON array of parameters in the following format:
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildRolePositions: Fetcher<
  typeof modifyGuildRolePositionsSchema,
  Role[],
  { auditLogReason: true }
> = async ({ guild, body }, options) =>
  patch(`/guilds/${guild}/roles`, body, options);
