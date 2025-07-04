import * as v from "valibot";
import {
  remove,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";

export const deleteGuildScheduledEventSchema = v.object({
  guild: snowflake,
  event: snowflake
});

/**
 * ### [Delete Guild Scheduled Event](https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event)
 *
 * **DELETE** `/guilds/:guild/scheduled-events/:event`
 *
 * Delete a guild scheduled event. Returns a `204` on success. Fires a Guild Scheduled Event Delete Gateway event.
 */
export const deleteGuildScheduledEvent: Fetcher<
  typeof deleteGuildScheduledEventSchema
> = async ({ guild, event }) =>
  remove(`/guilds/${guild}/scheduled-events/${event}`);

export const deleteGuildScheduledEventSafe = toValidated(
  deleteGuildScheduledEvent,
  deleteGuildScheduledEventSchema
);

export const deleteGuildScheduledEventProcedure = toProcedure(
  `mutation`,
  deleteGuildScheduledEvent,
  deleteGuildScheduledEventSchema
);
