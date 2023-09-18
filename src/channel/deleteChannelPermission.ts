import { z } from "zod";
import { remove, type Fetcher } from "../utils";

export const deleteChannelPermissionSchema = z.object({
  channel: z.string().min(1),
  overwrite: z.string().min(1)
});

/**
 * Delete a channel permission overwrite for a user or role in a channel. Only usable for guild channels. Requires the `MANAGE_ROLES` permission. Returns a 204 empty response on success. For more information about permissions, see [permissions](https://discord.com/developers/docs/topics/permissions#permissions)
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#delete-channel-permission
 */
export const deleteChannelPermission: Fetcher<
  typeof deleteChannelPermissionSchema
> = async ({ channel, overwrite }) =>
  remove(`/channels/${channel}/permissions/${overwrite}`);
