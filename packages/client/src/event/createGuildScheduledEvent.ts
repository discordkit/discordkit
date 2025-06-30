import {
  exactOptional,
  isoTimestamp,
  nonEmpty,
  object,
  pipe,
  string
} from "valibot";
import {
  post,
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
import { scheduledEventRecurrenceRuleSchema } from "./types/ScheduledEventRecurrenceRule.js";

export const createGuildScheduledEventSchema = object({
  guild: snowflake,
  body: object({
    /** the channel id of the scheduled event. */
    channelId: exactOptional(snowflake),
    /** entity metadata	the entity metadata of the scheduled event */
    entityMetadata: exactOptional(entityMetadataSchema),
    /** the name of the scheduled event */
    name: pipe(string(), nonEmpty()),
    /** the privacy level of the scheduled event */
    privacyLevel: scheduledEventPrivacyLevelSchema,
    /** the time to schedule the scheduled event */
    scheduledStartTime: pipe(string(), isoTimestamp()),
    /** the time when the scheduled event is scheduled to end */
    scheduledEndTime: exactOptional(pipe(string(), isoTimestamp())),
    /** the description of the scheduled event */
    description: exactOptional(pipe(string(), nonEmpty())),
    /** the entity type of the scheduled event */
    entityType: scheduledEventEntityTypeSchema,
    /** the cover image of the scheduled event */
    image: exactOptional(datauri),
    /** the definition for how often this event should recur */
    recurrenceRule: exactOptional(scheduledEventRecurrenceRuleSchema)
  })
});

/**
 * ### [Create Guild Scheduled Event](https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event)
 *
 * **POST** `/guilds/:guild/scheduled-events`
 *
 * Create a guild scheduled event in the guild. Returns a {@link ScheduledEvent | guild scheduled event object} on success. Fires a Guild Scheduled Event Create Gateway event.
 *
 * > [!NOTE]
 * >
 * > A guild can have a maximum of 100 events with `SCHEDULED` or `ACTIVE` status at any time.
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 */
export const createGuildScheduledEvent: Fetcher<
  typeof createGuildScheduledEventSchema,
  ScheduledEvent
> = async ({ guild, body }) => post(`/guilds/${guild}/scheduled-events`, body);

export const createGuildScheduledEventSafe = toValidated(
  createGuildScheduledEvent,
  createGuildScheduledEventSchema,
  scheduledEventSchema
);

export const createGuildScheduledEventProcedure = toProcedure(
  `mutation`,
  createGuildScheduledEvent,
  createGuildScheduledEventSchema,
  scheduledEventSchema
);
