import { z } from "zod";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated
} from "@discordkit/core";
import { type Channel, channelSchema } from "./types/Channel.ts";

export const deleteChannelSchema = z.object({
  channel: z.string().min(1)
});

/**
 * ### [Delete/Close Channel](https://discord.com/developers/docs/resources/channel#deleteclose-channel)
 *
 * **DELETE** `/channels/:channel`
 *
 * Delete a channel, or close a private message. Requires the `MANAGE_CHANNELS` permission for the guild, or `MANAGE_THREADS` if the channel is a thread. Deleting a category does not delete its child channels; they will have their `parentId` removed and a Channel Update Gateway event will fire for each of them. Returns a {@link Channel | channel object} on success. Fires a Channel Delete Gateway event (or Thread Delete if the channel was a thread).
 *
 * > **WARNING**
 * >
 * > Deleting a guild channel cannot be undone. Use this with caution, as it is impossible to undo this action when performed on a guild channel. In contrast, when used with a private message, it is possible to undo the action by opening a private message with the recipient again.
 *
 * > **NOTE**
 * >
 * > For Community guilds, the Rules or Guidelines channel and the Community Updates channel cannot be deleted.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const deleteChannel: Fetcher<
  typeof deleteChannelSchema,
  Channel
> = async ({ channel }) => remove(`/channels/${channel}`);

export const deleteChannelSafe = toValidated(
  deleteChannel,
  deleteChannelSchema,
  channelSchema
);

export const deleteChannelProcedure = toProcedure(
  `mutation`,
  deleteChannel,
  deleteChannelSchema,
  channelSchema
);
