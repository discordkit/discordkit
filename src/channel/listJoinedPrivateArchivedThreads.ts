import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { ArchivedThreads } from "./types";

export const listJoinedPrivateArchivedThreadsSchema = z.object({
  channel: z.string().min(1),
  params: z
    .object({
      /** returns threads before this timestamp */
      before: z.string().min(1),
      /** optional maximum number of threads to return */
      limit: z.number()
    })
    .partial()
    .optional()
});

/**
 * Returns archived threads in the channel that are of [type](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) `GUILD_PRIVATE_THREAD`, and the user has joined. Threads are ordered by their `id`, in descending order. Requires the `READ_MESSAGE_HISTORY` permission.
 *
 * https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads
 */
export const listJoinedPrivateArchivedThreads: Fetcher<
  typeof listJoinedPrivateArchivedThreadsSchema,
  ArchivedThreads
> = async ({ channel, params }) =>
  get(`/channels/${channel}/users/@me/threads/archived/private`, params);
