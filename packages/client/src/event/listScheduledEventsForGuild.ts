import { array, boolean, object, exactOptional, partial } from "valibot";
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
} from "./types/ScheduledEvent.js";

export const listScheduledEventsForGuildSchema = object({
  guild: snowflake,
  params: exactOptional(
    partial(
      object({
        withUserCount: boolean()
      })
    )
  )
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
  array(scheduledEventSchema)
);

export const listScheduledEventsForGuildProcedure = toProcedure(
  `query`,
  listScheduledEventsForGuild,
  listScheduledEventsForGuildSchema,
  array(scheduledEventSchema)
);

export const listScheduledEventsForGuildQuery = toQuery(
  listScheduledEventsForGuild
);
