import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const deleteChannelSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Delete a channel, or close a private message. Requires the `MANAGE_CHANNELS` permission for the guild, or `MANAGE_THREADS` if the channel is a thread. Deleting a category does not delete its child channels; they will have their `parent_id` removed and a [Channel Update](https://discord.com/developers/docs/topics/gateway#channel-update) Gateway event will fire for each of them. Returns a channel object on success. Fires a [Channel Delete](https://discord.com/developers/docs/topics/gateway#channel-delete) Gateway event (or [Thread Delete](https://discord.com/developers/docs/topics/gateway#thread-delete) if the channel was a thread).
 *
 * *Deleting a guild channel cannot be undone. Use this with caution, as it is impossible to undo this action when performed on a guild channel. In contrast, when used with a private message, it is possible to undo the action by opening a private message with the recipient again.*
 *
 * *For Community guilds, the Rules or Guidelines channel and the Community Updates channel cannot be deleted.*
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/channel#deleteclose-channel
 */
export const deleteChannel: Fetcher<typeof deleteChannelSchema> = async ({
  channel
}) => remove(`/channels/${channel}`);

export const deleteChannelProcedure = toProcedure(
  `mutation`,
  deleteChannel,
  deleteChannelSchema
);
