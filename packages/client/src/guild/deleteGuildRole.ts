import { object } from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGuildRoleSchema = object({
  guild: snowflake,
  role: snowflake
});

/**
 * ### [Delete Guild Role](https://discord.com/developers/docs/resources/guild#delete-guild-role)
 *
 * **DELETE* `/guilds/:guild/roles/:role`
 *
 * Delete a guild role. Requires the `MANAGE_ROLES` permission. Returns a `204 empty` response on success. Fires a Guild Role Delete Gateway event.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteGuildRole: Fetcher<typeof deleteGuildRoleSchema> = async ({
  guild,
  role
}) => remove(`/guilds/${guild}/roles/${role}`);

export const deleteGuildRoleSafe = toValidated(
  deleteGuildRole,
  deleteGuildRoleSchema
);

export const deleteGuildRoleProcedure = toProcedure(
  `mutation`,
  deleteGuildRole,
  deleteGuildRoleSchema
);
