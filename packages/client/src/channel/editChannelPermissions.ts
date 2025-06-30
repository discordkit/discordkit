import { nullish, object, picklist } from "valibot";
import {
  put,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  asDigits
} from "@discordkit/core";
import { permissionFlag } from "../permissions/Permissions.js";

export const editChannelPermissionsSchema = object({
  channel: snowflake,
  overwrite: snowflake,
  body: object({
    /** the bitwise value of all allowed permissions (default "0") */
    allow: nullish(asDigits(permissionFlag)),
    /** the bitwise value of all disallowed permissions (default "0") */
    deny: nullish(asDigits(permissionFlag)),
    /** 0 for a role or 1 for a member */
    type: picklist([0, 1])
  })
});

/**
 * ### [Edit Channel Permissions](https://discord.com/developers/docs/resources/channel#edit-channel-permissions)
 *
 * **PUT** `/channels/:channel/permissions/:overwrite`
 *
 * Edit the channel permission overwrites for a user or role in a channel. Only usable for guild channels. Requires the `MANAGE_ROLES` permission. Only permissions your bot has in the guild or parent channel (if applicable) can be allowed/denied (unless your bot has a `MANAGE_ROLES` overwrite in the channel). Returns a `204 empty` response on success. Fires a Channel Update Gateway event. For more information about permissions, see permissions.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const editChannelPermissions: Fetcher<
  typeof editChannelPermissionsSchema
> = async ({ channel, overwrite, body }) =>
  put(`/channels/${channel}/permissions/${overwrite}`, body);

export const editChannelPermissionsSafe = toValidated(
  editChannelPermissions,
  editChannelPermissionsSchema
);

export const editChannelPermissionsProcedure = toProcedure(
  `mutation`,
  editChannelPermissions,
  editChannelPermissionsSchema
);
