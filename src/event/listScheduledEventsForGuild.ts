import { z } from "zod";
import { get, query } from "../utils";
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
export const listScheduledEventsForGuild = query(
  listScheduledEventsForGuildSchema,
  async ({ input: { guild, params } }) =>
    get<ScheduledEvent[]>(`/guilds/${guild}/scheduled-events`, params)
);
