import {
  integer,
  isoTimestamp,
  minValue,
  nullish,
  number,
  object,
  exactOptional,
  partial,
  pipe,
  string
} from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  archivedThreadsSchema,
  type ArchivedThreads
} from "./types/ArchivedThreads.js";

export const listPrivateArchivedThreadsSchema = object({
  channel: snowflake,
  params: exactOptional(
    partial(
      object({
        /** returns threads before this timestamp */
        before: nullish(pipe(string(), isoTimestamp())),
        /** optional maximum number of threads to return */
        limit: nullish(pipe(number(), integer(), minValue(0)))
      })
    )
  )
});

/**
 * ### [List Private Archived Threads](https://discord.com/developers/docs/resources/channel#list-private-archived-threads)
 *
 * **GET** `/channels/:channel/threads/archived/private`
 *
 * Returns archived threads in the channel that are of type `PRIVATE_THREAD`. Threads are ordered by `archiveTimestamp`, in descending order. Requires both the `READ_MESSAGE_HISTORY` and `MANAGE_THREADS` permissions.
 */
export const listPrivateArchivedThreads: Fetcher<
  typeof listPrivateArchivedThreadsSchema,
  ArchivedThreads
> = async ({ channel, params }) =>
  get(`/channels/${channel}/threads/archived/private`, params);

export const listPrivateArchivedThreadsSafe = toValidated(
  listPrivateArchivedThreads,
  listPrivateArchivedThreadsSchema,
  archivedThreadsSchema
);

export const listPrivateArchivedThreadsProcedure = toProcedure(
  `query`,
  listPrivateArchivedThreads,
  listPrivateArchivedThreadsSchema,
  archivedThreadsSchema
);

export const listPrivateArchivedThreadsQuery = toQuery(
  listPrivateArchivedThreads
);
