import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { Channel, ThreadMember } from "../channel";

export const listActiveGuildThreadsSchema = z.object({
  guild: z.string().min(1)
});

/**
 * Returns all active threads in the guild, including public and private threads. Threads are ordered by their `id`, in descending order.
 *
 * https://discord.com/developers/docs/resources/guild#list-active-guild-threads
 */
export const listActiveGuildThreads: Fetcher<
  typeof listActiveGuildThreadsSchema,
  {
    /** the active threads */
    threads: Channel[];
    /** a thread member object for each returned thread the current user has joined */
    members: ThreadMember[];
  }
> = async ({ guild }) => get(`/guilds/${guild}/threads/active`);
