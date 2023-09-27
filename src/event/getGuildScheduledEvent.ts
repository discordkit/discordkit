import { z } from "zod";
import { get, type Fetcher, toProcedure, toQuery } from "../utils";
import {
  scheduledEventSchema,
  type ScheduledEvent
} from "./types/ScheduledEvent";

export const getGuildScheduledEventSchema = z.object({
  guild: z.string().min(1),
  event: z.string().min(1),
  params: z
    .object({
      /** include number of users subscribed to this event */
      withUserCount: z.boolean().nullable()
    })
    .partial()
    .optional()
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

export const getGuildScheduledEventProcedure = toProcedure(
  `query`,
  getGuildScheduledEvent,
  getGuildScheduledEventSchema,
  scheduledEventSchema
);

export const getGuildScheduledEventQuery = toQuery(getGuildScheduledEvent);
