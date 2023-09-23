import { z } from "zod";
import { put, type Fetcher, toProcedure } from "../utils";

export const joinThreadSchema = z.object({
  channel: z.string().min(1)
});

/**
 * Adds the current user to a thread. Also requires the thread is not archived. Returns a 204 empty response on success. Fires a [Thread Members Update](https://discord.com/developers/docs/topics/gateway#thread-members-update) Gateway event.
 *
 * https://discord.com/developers/docs/resources/channel#join-thread
 */
export const joinThread: Fetcher<typeof joinThreadSchema> = async ({
  channel
}) => put(`/channels/${channel}/thread-members/@me`);

export const joinThreadProcedure = toProcedure(
  `mutation`,
  joinThread,
  joinThreadSchema
);
