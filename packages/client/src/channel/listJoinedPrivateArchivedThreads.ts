import { z } from "zod";
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

export const listJoinedPrivateArchivedThreadsSchema = z.object({
  channel: snowflake,
  params: z
    .object({
      /** returns threads before this timestamp */
      before: z.string().datetime().nullish(),
      /** optional maximum number of threads to return */
      limit: z.number().int().positive().nullish()
    })
    .partial()
    .optional()
});

/**
 * ### [List Joined Private Archived Threads](https://discord.com/developers/docs/resources/channel#list-joined-private-archived-threads)
 *
 * **GET** `/channels/:channel/users/@me/threads/archived/private`
 *
 * Returns archived threads in the channel that are of type `PRIVATE_THREAD`, and the user has joined. Threads are ordered by their `id`, in descending order. Requires the `READ_MESSAGE_HISTORY` permission.
 */
export const listJoinedPrivateArchivedThreads: Fetcher<
  typeof listJoinedPrivateArchivedThreadsSchema,
  ArchivedThreads
> = async ({ channel, params }) =>
  get(`/channels/${channel}/users/@me/threads/archived/private`, params);

export const listJoinedPrivateArchivedThreadsSafe = toValidated(
  listJoinedPrivateArchivedThreads,
  listJoinedPrivateArchivedThreadsSchema,
  archivedThreadsSchema
);

export const listJoinedPrivateArchivedThreadsProcedure = toProcedure(
  `query`,
  listJoinedPrivateArchivedThreads,
  listJoinedPrivateArchivedThreadsSchema,
  archivedThreadsSchema
);

export const listJoinedPrivateArchivedThreadsQuery = toQuery(
  listJoinedPrivateArchivedThreads
);
