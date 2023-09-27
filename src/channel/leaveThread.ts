import { z } from "zod";
import { remove, type Fetcher, toProcedure } from "../utils";

export const leaveThreadSchema = z.object({
  channel: z.string().min(1)
});

/**
 * ### [Leave Thread](https://discord.com/developers/docs/resources/channel#leave-thread)
 *
 * **DELETE** `/channels/:channel/thread-members/@me`
 *
 * Removes the current user from a thread. Also requires the thread is not archived. Returns a `204 empty` response on success. Fires a Thread Members Update Gateway event.
 */
export const leaveThread: Fetcher<typeof leaveThreadSchema> = async ({
  channel
}) => remove(`/channels/${channel}/thread-members/@me`);

export const leaveThreadProcedure = toProcedure(
  `mutation`,
  leaveThread,
  leaveThreadSchema
);
