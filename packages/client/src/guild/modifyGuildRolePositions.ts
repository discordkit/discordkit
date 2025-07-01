import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "../permissions/Role.js";

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
 * Modify the positions of a set of role objects for the guild. Requires the `MANAGE_ROLES` permission. Returns a list of all of the guild's {@link Role | role objects} on success. Fires multiple Guild Role Update Gateway events.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const modifyGuildRolePositions: Fetcher<
  typeof modifyGuildRolePositionsSchema,
  Role[]
> = async ({ guild, body }) => patch(`/guilds/${guild}/roles`, body);

export const modifyGuildRolePositionsSafe = toValidated(
  modifyGuildRolePositions,
  modifyGuildRolePositionsSchema,
  v.array(roleSchema)
);

export const modifyGuildRolePositionsProcedure = toProcedure(
  `mutation`,
  modifyGuildRolePositions,
  modifyGuildRolePositionsSchema,
  v.array(roleSchema)
);
