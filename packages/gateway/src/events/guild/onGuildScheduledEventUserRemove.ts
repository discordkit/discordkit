import { dispatchEvent } from "../dispatch.js";
import type { GuildScheduledEventUser } from "./types/GuildResourceEvents.js";

/**
 * ### [Guild Scheduled Event User Remove](https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-remove)
 *
 * Sent when a user unsubscribes from a guild scheduled event.
 *
 * Gated by `GUILD_SCHEDULED_EVENTS`.
 */
export const onGuildScheduledEventUserRemove = dispatchEvent<
  GuildScheduledEventUser,
  `GUILD_SCHEDULED_EVENT_USER_REMOVE`
>(`GUILD_SCHEDULED_EVENT_USER_REMOVE`);
