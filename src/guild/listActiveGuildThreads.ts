import { z } from "zod";
import { get, type Fetcher, createProcedure } from "../utils";
import { channelMentionSchema, threadMemberSchema } from "../channel";

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
 * Returns all active threads in the guild, including public and private threads. Threads are ordered by their `id`, in descending order.
 *
 * https://discord.com/developers/docs/resources/guild#list-active-guild-threads
 */
export const listActiveGuildThreads: Fetcher<
  typeof listActiveGuildThreadsSchema,
  z.infer<typeof activeGuildThreadsSchema>
> = async ({ guild }) => get(`/guilds/${guild}/threads/active`);

export const listActiveGuildThreadsProcedure = createProcedure(
  `query`,
  listActiveGuildThreads,
  listActiveGuildThreadsSchema,
  activeGuildThreadsSchema
);
