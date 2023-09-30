import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated
} from "#/utils/index.ts";

export const modifyGuildChannelPositionsSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** channel id */
      id: z.string().min(1),
      /** sorting position of the channel */
      position: z.number().positive().nullable().optional(),
      /** syncs the permission overwrites with the new parent, if moving to a new category */
      lockPermissions: z.boolean().nullable().optional(),
      /** the new parent ID for the channel that is moved */
      parentId: z.string().min(1).nullable().optional()
    })
    .array()
});

/**
 * ### [Modify Guild Channel Positions](https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions)
 *
 * **PATCH** `/guilds/:guild/channels`
 *
 * Modify the positions of a set of channel objects for the guild. Requires `MANAGE_CHANNELS` permission. Returns a `204 empty` response on success. Fires multiple Channel Update Gateway events.
 *
 * > **NOTE**
 * >
 * > Only channels to be modified are required.
 */
export const modifyGuildChannelPositions: Fetcher<
  typeof modifyGuildChannelPositionsSchema
> = async ({ guild, body }) => patch(`/guilds/${guild}/channels`, body);

export const modifyGuildChannelPositionsSafe = toValidated(
  modifyGuildChannelPositions,
  modifyGuildChannelPositionsSchema
);

export const modifyGuildChannelPositionsProcedure = toProcedure(
  `mutation`,
  modifyGuildChannelPositions,
  modifyGuildChannelPositionsSchema
);
