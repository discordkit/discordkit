import { z } from "zod";
import { get, type Fetcher } from "../utils";
import type { ScheduledEvent } from "./types";

export const getGuildScheduledEventSchema = z.object({
  guild: z.string().min(1),
  event: z.string().min(1),
  params: z
    .object({
      /** include number of users subscribed to this event */
      withUserCount: z.boolean()
    })
    .partial()
    .optional()
});

/**
 * Get a guild scheduled event. Returns a guild scheduled event object on success.
 *
 * https://discord.com/developers/docs/resources/guild-scheduled-event#get-guild-scheduled-event
 */
export const getGuildScheduledEvent: Fetcher<
  typeof getGuildScheduledEventSchema,
  ScheduledEvent
> = async ({ guild, event, params }) =>
  get(`/guilds/${guild}/scheduled-events/${event}`, params);
