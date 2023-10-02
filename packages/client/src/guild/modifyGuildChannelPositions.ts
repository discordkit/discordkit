import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const modifyGuildChannelPositionsSchema = z.object({
  guild: snowflake,
  body: z
    .object({
      /** channel id */
      id: snowflake,
      /** sorting position of the channel */
      position: z.number().positive().nullish(),
      /** syncs the permission overwrites with the new parent, if moving to a new category */
      lockPermissions: z.boolean().nullish(),
      /** the new parent ID for the channel that is moved */
      parentId: snowflake.nullish()
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
