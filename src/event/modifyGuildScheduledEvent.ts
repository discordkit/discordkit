import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import {
  type ScheduledEvent,
  scheduledEventSchema
} from "./types/ScheduledEvent";
import { entityMetadataSchema } from "./types/EntityMetadata";
import { scheduledEventPrivacyLevelSchema } from "./types/ScheduledEventPrivacyLevel";
import { scheduledEventEntityTypeSchema } from "./types/ScheduledEventEntityType";
import { scheduledEventStatusSchema } from "./types/ScheduledEventStatus";

export const modifyGuildScheduledEventSchema = z.object({
  guild: z.string().min(1),
  event: z.string().min(1),
  body: z
    .object({
      /** the channel id of the scheduled event. */
      channelId: z.string().min(1),
      /** entity metadata	the entity metadata of the scheduled event */
      entityMetadata: entityMetadataSchema,
      /** the name of the scheduled event */
      name: z.string().min(1),
      /** the privacy level of the scheduled event */
      privacyLevel: scheduledEventPrivacyLevelSchema,
      /** the time to schedule the scheduled event */
      scheduledStartTime: z.string().min(1),
      /** the time when the scheduled event is scheduled to end */
      scheduledEndTime: z.string().min(1),
      /** the description of the scheduled event */
      description: z.string().min(1),
      /** the entity type of the scheduled event */
      entityType: scheduledEventEntityTypeSchema,
      /** the status of the scheduled event */
      status: scheduledEventStatusSchema,
      /** the cover image of the scheduled event */
      image: z.string().min(1)
    })
    .partial()
});

/**
 * Modify a guild scheduled event. Returns the modified guild scheduled event object on success.
 *
 * *To start or end an event, use this endpoint to modify the event's [status](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object-guild-scheduled-event-status) field.*
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * *This endpoint silently discards `entity_metadata` for non-`EXTERNAL` events.**
 * https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event
 */
export const modifyGuildScheduledEvent: Fetcher<
  typeof modifyGuildScheduledEventSchema,
  ScheduledEvent
> = async ({ guild, event, body }) =>
  patch(`/guilds/${guild}/scheduled-events/${event}`, body);

export const modifyGuildScheduledEventProcedure = toProcedure(
  `mutation`,
  modifyGuildScheduledEvent,
  modifyGuildScheduledEventSchema,
  scheduledEventSchema
);
