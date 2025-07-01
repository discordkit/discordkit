import * as v from "valibot";
import {
  get,
  type Fetcher,
  toProcedure,
  toQuery,
  toValidated,
  snowflake
} from "@discordkit/core";
import { threadMemberSchema } from "../channel/types/ThreadMember.js";
import { threadChannelSchema } from "../channel/types/Channel.js";

export const listActiveGuildThreadsSchema = v.object({
  guild: snowflake
});

export const activeGuildThreadsSchema = v.object({
  /** the active threads */
  threads: v.array(threadChannelSchema),
  /** a thread member object for each returned thread the current user has joined */
  members: v.array(threadMemberSchema)
});

/**
 * ### [List Active Guild Threads](https://discord.com/developers/docs/resources/guild#list-active-guild-threads)
 *
 * **GET** `/guilds/:guild/threads/active`
 *
 * Returns all active threads in the guild, including public and private threads. Threads are ordered by their `id`, in descending order.
 */
export const listActiveGuildThreads: Fetcher<
  typeof listActiveGuildThreadsSchema,
  v.InferOutput<typeof activeGuildThreadsSchema>
> = async ({ guild }) => get(`/guilds/${guild}/threads/active`);

export const listActiveGuildThreadsSafe = toValidated(
  listActiveGuildThreads,
  listActiveGuildThreadsSchema,
  activeGuildThreadsSchema
);

export const listActiveGuildThreadsProcedure = toProcedure(
  `query`,
  listActiveGuildThreads,
  listActiveGuildThreadsSchema,
  activeGuildThreadsSchema
);

export const listActiveGuildThreadsQuery = toQuery(listActiveGuildThreads);
