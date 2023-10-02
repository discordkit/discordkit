import { z } from "zod";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import {
  type ScheduledEvent,
  scheduledEventSchema
} from "./types/ScheduledEvent.ts";
import { entityMetadataSchema } from "./types/EntityMetadata.ts";
import { scheduledEventPrivacyLevelSchema } from "./types/ScheduledEventPrivacyLevel.ts";
import { scheduledEventEntityTypeSchema } from "./types/ScheduledEventEntityType.ts";
import { scheduledEventStatusSchema } from "./types/ScheduledEventStatus.ts";

export const modifyGuildScheduledEventSchema = z.object({
  guild: snowflake,
  event: snowflake,
  body: z.object({
    /** the channel id of the scheduled event. */
    channelId: snowflake.nullish(),
    /** entity metadata	the entity metadata of the scheduled event */
    entityMetadata: entityMetadataSchema.nullish(),
    /** the name of the scheduled event */
    name: z.string().min(1).nullish(),
    /** the privacy level of the scheduled event */
    privacyLevel: scheduledEventPrivacyLevelSchema.nullish(),
    /** the time to schedule the scheduled event */
    scheduledStartTime: z.string().datetime().nullish(),
    /** the time when the scheduled event is scheduled to end */
    scheduledEndTime: z.string().datetime().nullish(),
    /** the description of the scheduled event */
    description: z.string().min(1).nullish(),
    /** the entity type of the scheduled event */
    entityType: scheduledEventEntityTypeSchema.nullish(),
    /** the status of the scheduled event */
    status: scheduledEventStatusSchema.nullish(),
    /** the cover image of the scheduled event */
    image: z.string().min(1).nullish()
  })
});

/**
 * ### [Modify Guild Scheduled Event](https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event)
 *
 * **PATCH** `/guilds/:guild/scheduled-events/:event`
 *
 * Modify a guild scheduled event. Returns the modified {@link ScheduledEvent | guild scheduled event object} on success. Fires a Guild Scheduled Event Update Gateway event.
 *
 * > **NOTE**
 * >
 * > To start or end an event, use this endpoint to modify the event's status field.
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * > **NOTE**
 * >
 * > This endpoint silently discards `entity_metadata` for non-`EXTERNAL` events.
 */
export const modifyGuildScheduledEvent: Fetcher<
  typeof modifyGuildScheduledEventSchema,
  ScheduledEvent
> = async ({ guild, event, body }) =>
  patch(`/guilds/${guild}/scheduled-events/${event}`, body);

export const modifyGuildScheduledEventSafe = toValidated(
  modifyGuildScheduledEvent,
  modifyGuildScheduledEventSchema,
  scheduledEventSchema
);

export const modifyGuildScheduledEventProcedure = toProcedure(
  `mutation`,
  modifyGuildScheduledEvent,
  modifyGuildScheduledEventSchema,
  scheduledEventSchema
);
