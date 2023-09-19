import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { archivedThreadsSchema, type ArchivedThreads } from "./types";

export const listPublicArchivedThreadsSchema = z.object({
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
 * Returns archived threads in the channel that are public. When called on a `GUILD_TEXT` channel, returns threads of [type](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) `GUILD_PUBLIC_THREAD`. When called on a `GUILD_NEWS` channel returns threads of [type](https://discord.com/developers/docs/resources/channel#channel-object-channel-types) `GUILD_NEWS_THREAD`. Threads are ordered by `archive_timestamp`, in descending order. Requires the `READ_MESSAGE_HISTORY` permission.
 *
 * https://discord.com/developers/docs/resources/channel#list-public-archived-threads
 */
export const listPublicArchivedThreads: Fetcher<
  typeof listPublicArchivedThreadsSchema,
  ArchivedThreads
> = async ({ channel, params }) =>
  get(`/channels/${channel}/threads/archived/public`, params);

export const listPublicArchivedThreadsProcedure = createProcedure(
  `query`,
  listPublicArchivedThreads,
  listPublicArchivedThreadsSchema,
  archivedThreadsSchema
);
