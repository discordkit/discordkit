import * as v from "valibot";
import { patch, type Fetcher } from "@discordkit/core/requests/methods";
import { datauri } from "@discordkit/core/validations/datauri";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { timestamp } from "@discordkit/core/validations/timestamp";
import { type ScheduledEvent } from "./types/ScheduledEvent.js";
import { entityMetadataSchema } from "./types/EntityMetadata.js";
import { scheduledEventPrivacyLevelSchema } from "./types/ScheduledEventPrivacyLevel.js";
import { scheduledEventEntityTypeSchema } from "./types/ScheduledEventEntityType.js";
import { scheduledEventStatusSchema } from "./types/ScheduledEventStatus.js";
import { scheduledEventRecurrenceRuleSchema } from "./types/ScheduledEventRecurrenceRule.js";

export const modifyGuildScheduledEventSchema = v.object({
  guild: snowflake,
  event: snowflake,
  body: v.object({
    /** the channel id of the scheduled event. */
    channelId: v.nullish(snowflake),
    /** entity metadata	the entity metadata of the scheduled event */
    entityMetadata: v.nullish(entityMetadataSchema),
    /** the name of the scheduled event */
    name: v.exactOptional(v.pipe(v.string(), v.nonEmpty())),
    /** the privacy level of the scheduled event */
    privacyLevel: v.exactOptional(scheduledEventPrivacyLevelSchema),
    /** the time to schedule the scheduled event */
    scheduledStartTime: v.exactOptional(timestamp),
    /** the time when the scheduled event is scheduled to end */
    scheduledEndTime: v.exactOptional(timestamp),
    /** the description of the scheduled event */
    description: v.nullish(v.pipe(v.string(), v.nonEmpty())),
    /** the entity type of the scheduled event */
    entityType: v.exactOptional(scheduledEventEntityTypeSchema),
    /** the status of the scheduled event */
    status: v.exactOptional(scheduledEventStatusSchema),
    /** the cover image of the scheduled event */
    image: v.exactOptional(datauri),
    /** the definition for how often this event should recur */
    recurrenceRule: v.exactOptional(scheduledEventRecurrenceRuleSchema)
  })
});

/**
 * ### [Modify Guild Scheduled Event](https://discord.com/developers/docs/resources/guild-scheduled-event#modify-guild-scheduled-event)
 *
 * **PATCH** `/guilds/:guild/scheduled-events/:event`
 *
 * Modify a {@link ScheduledEvent | guild scheduled event}. Returns the modified {@link ScheduledEvent | guild scheduled event object} on success. Fires a Guild Scheduled Event Update Gateway event.
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
 *
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional.
 */
export const modifyGuildScheduledEvent: Fetcher<
  typeof modifyGuildScheduledEventSchema,
  ScheduledEvent,
  { auditLogReason: true }
> = async ({ guild, event, body }, options) =>
  patch(`/guilds/${guild}/scheduled-events/${event}`, body, options);
