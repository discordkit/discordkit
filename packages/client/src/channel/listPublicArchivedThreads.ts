import * as v from "valibot";
import { get, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { type ArchivedThreads } from "./types/ArchivedThreads.js";

export const listPublicArchivedThreadsSchema = v.object({
  channel: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** returns threads before this timestamp */
        before: timestamp,
        /** optional maximum number of threads to return */
        limit: v.pipe(v.number(), v.integer(), v.minValue(0))
      })
    )
  )
});

/**
 * ### [List Public Archived Threads](https://discord.com/developers/docs/resources/channel#list-public-archived-threads)
 *
 * **GET** `/channels/:channel/threads/archived/public`
 *
 * Returns archived threads in the channel that are public. When called on a `GUILD_TEXT` channel, returns threads of type `PUBLIC_THREAD`. When called on a `GUILD_ANNOUNCEMENT` channel returns threads of type `ANNOUNCEMENT_THREAD`. Threads are ordered by `archiveTimestamp`, in descending order. Requires the `READ_MESSAGE_HISTORY` permission.
 */
export const listPublicArchivedThreads: Fetcher<
  typeof listPublicArchivedThreadsSchema,
  ArchivedThreads
> = async ({ channel, params }) =>
  get(`/channels/${channel}/threads/archived/public`, params);
