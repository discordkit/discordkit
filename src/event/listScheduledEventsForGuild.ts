import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { ScheduledEvent } from "./types";

export const listScheduledEventsForGuildSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      withUserCount: z.boolean()
    })
    .partial()
    .optional()
});

/**
 * Returns a list of guild scheduled event objects for the given guild.
 *
 * https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild
 */
export const listScheduledEventsForGuild: Fetcher<
  typeof listScheduledEventsForGuildSchema,
  ScheduledEvent[]
> = async ({ guild, params }) =>
  get(`/guilds/${guild}/scheduled-events`, params);
