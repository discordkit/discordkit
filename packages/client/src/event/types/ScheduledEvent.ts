import {
  type InferOutput,
  object,
  intersect,
  string,
  number,
  nullish,
  isoTimestamp,
  integer,
  minValue,
  pipe,
  nullable,
  exactOptional,
  variant,
  literal,
  null_,
  nonEmpty,
  maxLength
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { ScheduledEventEntityType } from "./ScheduledEventEntityType.js";
import { scheduledEventPrivacyLevelSchema } from "./ScheduledEventPrivacyLevel.js";
import { scheduledEventStatusSchema } from "./ScheduledEventStatus.js";
import { entityMetadataSchema } from "./EntityMetadata.js";
import { scheduledEventRecurrenceRuleSchema } from "./ScheduledEventRecurrenceRule.js";

export const scheduledEventSchema = intersect([
  object({
    /** the id of the scheduled event */
    id: snowflake,
    /** the guild id which the scheduled event belongs to */
    guildId: snowflake,
    /** the id of the user that created the scheduled event */
    creatorId: nullish(snowflake),
    /** the name of the scheduled event (1-100 characters) */
    name: pipe(string(), nonEmpty(), maxLength(100)),
    /** the description of the scheduled event (1-1000 characters) */
    description: nullish(pipe(string(), nonEmpty(), maxLength(1000))),
    /** the time the scheduled event will start */
    scheduledStartTime: pipe(string(), isoTimestamp()),
    /** the time the scheduled event will end, required if entity_type is EXTERNAL */
    scheduledEndTime: nullable(pipe(string(), isoTimestamp())),
    /** the privacy level of the scheduled event */
    privacyLevel: scheduledEventPrivacyLevelSchema,
    /** the status of the scheduled event */
    status: scheduledEventStatusSchema,
    /** the id of an entity associated with a guild scheduled event */
    entityId: nullable(snowflake),
    /** the user that created the scheduled event */
    creator: exactOptional(userSchema),
    /** the number of users subscribed to the scheduled event */
    userCount: exactOptional(pipe(number(), integer(), minValue(0))),
    /** the cover image hash of the scheduled event */
    image: nullish(pipe(string(), nonEmpty())),
    /** the definition for how often this event should recur */
    recurrenceRule: nullable(scheduledEventRecurrenceRuleSchema)
  }),
  variant(`entityType`, [
    object({
      /** the type of the scheduled event */
      entityType: literal(ScheduledEventEntityType.STAGE_INSTANCE),
      /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
      channelId: snowflake,
      /** additional metadata for the guild scheduled event */
      entityMetadata: null_()
    }),
    object({
      /** the type of the scheduled event */
      entityType: literal(ScheduledEventEntityType.VOICE),
      /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
      channelId: snowflake,
      /** additional metadata for the guild scheduled event */
      entityMetadata: null_()
    }),
    object({
      /** the type of the scheduled event */
      entityType: literal(ScheduledEventEntityType.EXTERNAL),
      /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
      channelId: null_(),
      /** the time the scheduled event will end, required if entity_type is EXTERNAL */
      scheduledEndTime: pipe(string(), isoTimestamp()),
      /** additional metadata for the guild scheduled event */
      entityMetadata: entityMetadataSchema
    })
  ])
]);

export type ScheduledEvent = InferOutput<typeof scheduledEventSchema>;
