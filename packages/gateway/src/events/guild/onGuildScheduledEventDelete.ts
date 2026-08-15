import type { ScheduledEvent } from "@discordkit/client/event/types/ScheduledEvent";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Guild Scheduled Event Delete](https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-delete)
 *
 * Sent when a guild scheduled event is deleted. The inner payload is a guild
 * scheduled event object.
 *
 * Gated by `GUILD_SCHEDULED_EVENTS`.
 */
export const onGuildScheduledEventDelete = dispatchEvent<
  ScheduledEvent,
  `GUILD_SCHEDULED_EVENT_DELETE`
>(`GUILD_SCHEDULED_EVENT_DELETE`, [`GUILD_SCHEDULED_EVENTS`]);
