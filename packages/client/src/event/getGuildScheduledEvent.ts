import * as v from "valibot";
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

export const getGuildScheduledEventSchema = v.object({
  guild: snowflake,
  event: snowflake,
  params: v.exactOptional(
    v.partial(
      v.object({
        /** include number of users subscribed to this event */
        withUserCount: v.boolean()
      })
    )
  )
});

/**
 * ### [Get Guild Scheduled Event](https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event)
 *
 * **GET** `/guilds/:guild/scheduled-events/:event`
 *
 * Get a guild scheduled event. Returns a {@link ScheduledEvent | guild scheduled event object} on success.
 */
export const getGuildScheduledEvent: Fetcher<
  typeof getGuildScheduledEventSchema,
  ScheduledEvent
> = async ({ guild, event, params }) =>
  get(`/guilds/${guild}/scheduled-events/${event}`, params);

export const getGuildScheduledEventSafe = toValidated(
  getGuildScheduledEvent,
  getGuildScheduledEventSchema,
  scheduledEventSchema
);

export const getGuildScheduledEventProcedure = toProcedure(
  `query`,
  getGuildScheduledEvent,
  getGuildScheduledEventSchema,
  scheduledEventSchema
);

export const getGuildScheduledEventQuery = toQuery(getGuildScheduledEvent);
