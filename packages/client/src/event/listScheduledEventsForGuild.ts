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
  scheduledEventSchema,
  type ScheduledEvent
} from "./types/ScheduledEvent.ts";

export const listScheduledEventsForGuildSchema = z.object({
  guild: snowflake,
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

export const listScheduledEventsForGuildSafe = toValidated(
  listScheduledEventsForGuild,
  listScheduledEventsForGuildSchema,
  scheduledEventSchema.array()
);

export const listScheduledEventsForGuildProcedure = toProcedure(
  `query`,
  listScheduledEventsForGuild,
  listScheduledEventsForGuildSchema,
  scheduledEventSchema.array()
);

export const listScheduledEventsForGuildQuery = toQuery(
  listScheduledEventsForGuild
);
