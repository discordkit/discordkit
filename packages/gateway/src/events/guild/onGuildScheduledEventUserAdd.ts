import { dispatchEvent } from "../dispatch.js";
import type { GuildScheduledEventUser } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Scheduled Event User Add](https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add)
 *
 * Sent when a user subscribes to a guild scheduled event.
 *
 * Gated by `GUILD_SCHEDULED_EVENTS`.
 */
export const onGuildScheduledEventUserAdd = dispatchEvent<
  GuildScheduledEventUser,
  `GUILD_SCHEDULED_EVENT_USER_ADD`
>(`GUILD_SCHEDULED_EVENT_USER_ADD`, [`GUILD_SCHEDULED_EVENTS`]);
