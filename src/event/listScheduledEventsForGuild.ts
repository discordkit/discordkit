import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import {
  scheduledEventSchema,
  type ScheduledEvent
} from "./types/ScheduledEvent";

export const listScheduledEventsForGuildSchema = z.object({
  guild: z.string().min(1),
  params: z
    .object({
      withUserCount: z.boolean().nullable()
    })
    .partial()
    .optional()
});

/**
 * ### [List Scheduled Events for Guild](https://discord.com/developers/docs/resources/guild-scheduled-event#list-scheduled-events-for-guild)
 *
 * **GET** `/guilds/:guild/scheduled-events`
 *
 * Returns a list of {@link ScheduledEvent | guild scheduled event objects} for the given guild.
 */
export const listScheduledEventsForGuild: Fetcher<
  typeof listScheduledEventsForGuildSchema,
  ScheduledEvent[]
> = async ({ guild, params }) =>
  get(`/guilds/${guild}/scheduled-events`, params);

export const listScheduledEventsForGuildProcedure = toProcedure(
  `query`,
  listScheduledEventsForGuild,
  listScheduledEventsForGuildSchema,
  scheduledEventSchema.array()
);

export const listScheduledEventsForGuildQuery = toQuery(
  listScheduledEventsForGuild
);
