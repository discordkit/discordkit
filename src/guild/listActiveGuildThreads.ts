import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import { threadMemberSchema } from "../channel/types/ThreadMember";
import { channelMentionSchema } from "../channel/types/ChannelMention";

export const listActiveGuildThreadsSchema = z.object({
  guild: z.string().min(1)
});

export const activeGuildThreadsSchema = z.object({
  /** the active threads */
  threads: channelMentionSchema.array(),
  /** a thread member object for each returned thread the current user has joined */
  members: threadMemberSchema.array()
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
  z.infer<typeof activeGuildThreadsSchema>
> = async ({ guild }) => get(`/guilds/${guild}/threads/active`);

export const listActiveGuildThreadsProcedure = toProcedure(
  `query`,
  listActiveGuildThreads,
  listActiveGuildThreadsSchema,
  activeGuildThreadsSchema
);

export const listActiveGuildThreadsQuery = toQuery(listActiveGuildThreads);
