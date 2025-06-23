import {
  array,
  integer,
  minValue,
  nullish,
  number,
  object,
  pipe
} from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { roleSchema, type Role } from "./types/Role.js";

export const modifyGuildRolePositionsSchema = object({
  guild: snowflake,
  body: array(
    object({
      /** role */
      id: snowflake,
      /** sorting position of the role */
      position: nullish(pipe(number(), integer(), minValue(0)))
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
  array(roleSchema)
);

export const modifyGuildRolePositionsProcedure = toProcedure(
  `mutation`,
  modifyGuildRolePositions,
  modifyGuildRolePositionsSchema,
  array(roleSchema)
);
