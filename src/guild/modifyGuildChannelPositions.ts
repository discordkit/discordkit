import { z } from "zod";
import { patch, type Fetcher } from "../utils";

export const modifyGuildChannelPositionsSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** channel id */
      id: z.string().min(1),
      /** sorting position of the channel */
      position: z.number().positive().nullable(),
      /** syncs the permission overwrites with the new parent, if moving to a new category */
      lockPermissions: z.boolean().nullable(),
      /** the new parent ID for the channel that is moved */
      parentId: z.string().min(1).nullable()
    })
    .array()
});

/**
 * Modify the positions of a set of channel objects for the guild. Requires `MANAGE_CHANNELS` permission. Returns a 204 empty response on success. Fires multiple [Channel Update](https://discord.com/developers/docs/topics/gateway#channel-update) Gateway events.
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions
 */
export const modifyGuildChannelPositions: Fetcher<
  typeof modifyGuildChannelPositionsSchema
> = async ({ guild, body }) => patch(`/guilds/${guild}/channels`, body);
