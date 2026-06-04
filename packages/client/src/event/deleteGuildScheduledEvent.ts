import * as v from "valibot";
import { remove, type Fetcher } from "@discordkit/core/requests/methods";
import { snowflake } from "@discordkit/core/validations/snowflake";

export const deleteGuildScheduledEventSchema = v.object({
  guild: snowflake,
  event: snowflake
});

/**
 * ### [Delete Guild Scheduled Event](https://discord.com/developers/docs/resources/guild-scheduled-event#delete-guild-scheduled-event)
 *
 * **DELETE** `/guilds/:guild/scheduled-events/:event`
 *
 * Delete a {@link ScheduledEvent | guild scheduled event}. Returns a `204` on success. Fires a Guild Scheduled Event Delete Gateway event.
 */
export const deleteGuildScheduledEvent: Fetcher<
  typeof deleteGuildScheduledEventSchema
> = async ({ guild, event }) =>
  remove(`/guilds/${guild}/scheduled-events/${event}`);
