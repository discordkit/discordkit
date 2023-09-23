import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import {
  archivedThreadsSchema,
  type ArchivedThreads
} from "./types/ArchivedThreads";

export const listPrivateArchivedThreadsSchema = z.object({
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
 * Returns archived threads in the channel that are of [type](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) `GUILD_PRIVATE_THREAD`. Threads are ordered by `archive_timestamp`, in descending order. Requires both the `READ_MESSAGE_HISTORY` and `MANAGE_THREADS` permissions.
 *
 * https://discord.com/developers/docs/resources/channel#list-private-archived-threads
 */
export const listPrivateArchivedThreads: Fetcher<
  typeof listPrivateArchivedThreadsSchema,
  ArchivedThreads
> = async ({ channel, params }) =>
  get(`/channels/${channel}/threads/archived/private`, params);

export const listPrivateArchivedThreadsProcedure = toProcedure(
  `query`,
  listPrivateArchivedThreads,
  listPrivateArchivedThreadsSchema,
  archivedThreadsSchema
);

export const listPrivateArchivedThreadsQuery = toQuery(
  listPrivateArchivedThreads
);
