import type { ScheduledEvent } from "@discordkit/client/event/types/ScheduledEvent";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Guild Scheduled Event Update](https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-update)
 *
 * Sent when a guild scheduled event is updated. The inner payload is a guild
 * scheduled event object.
 *
 * Gated by `GUILD_SCHEDULED_EVENTS`.
 */
export const onGuildScheduledEventUpdate = dispatchEvent<
  ScheduledEvent,
  `GUILD_SCHEDULED_EVENT_UPDATE`
>(`GUILD_SCHEDULED_EVENT_UPDATE`);
