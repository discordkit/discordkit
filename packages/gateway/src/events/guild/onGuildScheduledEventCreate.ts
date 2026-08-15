import type { ScheduledEvent } from "@discordkit/client/event/types/ScheduledEvent";
import { dispatchEvent } from "../dispatch.js";

/**
 * ### [Guild Scheduled Event Create](https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-create)
 *
 * Sent when a guild scheduled event is created. The inner payload is a guild
 * scheduled event object.
 *
 * Gated by `GUILD_SCHEDULED_EVENTS`.
 */
export const onGuildScheduledEventCreate = dispatchEvent<
  ScheduledEvent,
  `GUILD_SCHEDULED_EVENT_CREATE`
>(`GUILD_SCHEDULED_EVENT_CREATE`, [`GUILD_SCHEDULED_EVENTS`]);
