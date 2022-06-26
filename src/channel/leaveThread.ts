import { z } from "zod";
import { mutation, remove } from "../utils";

export const leaveThreadSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Removes the current user from a thread. Also requires the thread is not archived. Returns a 204 empty response on success. Fires a [Thread Members Update Gateway](https://discord.com/developers/docs/topics/gateway#thread-members-update) event.
 *
 * https://discord.com/developers/docs/resources/channel#leave-thread
 */
export const leaveThread = mutation(leaveThreadSchema, async ({ channel }) =>
  remove(`/channels/${channel}/thread-members/@me`)
);
