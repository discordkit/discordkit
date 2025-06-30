import {
  exactOptional,
  isoTimestamp,
  nonEmpty,
  nullish,
  object,
  pipe,
  string
} from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  datauri
} from "@discordkit/core";
import {
  type ScheduledEvent,
  scheduledEventSchema
} from "./types/ScheduledEvent.js";
import { entityMetadataSchema } from "./types/EntityMetadata.js";
import { scheduledEventPrivacyLevelSchema } from "./types/ScheduledEventPrivacyLevel.js";
import { scheduledEventEntityTypeSchema } from "./types/ScheduledEventEntityType.js";
import { scheduledEventStatusSchema } from "./types/ScheduledEventStatus.js";
import { scheduledEventRecurrenceRuleSchema } from "./types/ScheduledEventRecurrenceRule.js";

export const modifyGuildScheduledEventSchema = object({
  guild: snowflake,
  event: snowflake,
  body: object({
    /** the channel id of the scheduled event. */
    channelId: nullish(snowflake),
    /** entity metadata	the entity metadata of the scheduled event */
    entityMetadata: nullish(entityMetadataSchema),
    /** the name of the scheduled event */
    name: exactOptional(pipe(string(), nonEmpty())),
    /** the privacy level of the scheduled event */
    privacyLevel: exactOptional(scheduledEventPrivacyLevelSchema),
    /** the time to schedule the scheduled event */
    scheduledStartTime: exactOptional(pipe(string(), isoTimestamp())),
    /** the time when the scheduled event is scheduled to end */
    scheduledEndTime: exactOptional(pipe(string(), isoTimestamp())),
    /** the description of the scheduled event */
    description: nullish(pipe(string(), nonEmpty())),
    /** the entity type of the scheduled event */
    entityType: exactOptional(scheduledEventEntityTypeSchema),
    /** the status of the scheduled event */
    status: exactOptional(scheduledEventStatusSchema),
    /** the cover image of the scheduled event */
    image: exactOptional(datauri),
    /** the definition for how often this event should recur */
    recurrenceRule: exactOptional(scheduledEventRecurrenceRuleSchema)
  })
});

/**
 * ### [Modify Guild Scheduled Event](https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event)
 *
 * **PATCH** `/guilds/:guild/scheduled-events/:event`
 *
 * Modify a guild scheduled event. Returns the modified {@link ScheduledEvent | guild scheduled event object} on success. Fires a Guild Scheduled Event Update Gateway event.
 *
 * > [!NOTE]
 * >
 * > To start or end an event, use this endpoint to modify the event's status field.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * > [!NOTE]
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
