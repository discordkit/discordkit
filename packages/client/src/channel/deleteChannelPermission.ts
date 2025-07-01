import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteChannelPermissionSchema = v.object({
  channel: snowflake,
  overwrite: snowflake
});

/**
 * ### [Delete Channel Permission](https://discord.com/developers/docs/resources/channel#delete-channel-permission)
 *
 * **DELETE** `/channels/:channel/permissions/:overwrite`
 *
 * Delete a channel permission overwrite for a user or role in a channel. Only usable for guild channels. Requires the `MANAGE_ROLES` permission. Returns a `204 empty` response on success. Fires a Channel Update Gateway event. For more information about permissions, see permissions
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteChannelPermission: Fetcher<
  typeof deleteChannelPermissionSchema
> = async ({ channel, overwrite }) =>
  remove(`/channels/${channel}/permissions/${overwrite}`);

export const deleteChannelPermissionSafe = toValidated(
  deleteChannelPermission,
  deleteChannelPermissionSchema
);

export const deleteChannelPermissionProcedure = toProcedure(
  `mutation`,
  deleteChannelPermission,
  deleteChannelPermissionSchema
);
