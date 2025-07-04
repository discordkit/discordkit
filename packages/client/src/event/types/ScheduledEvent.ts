import * as v from "valibot";
import { snowflake, timestamp } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { ScheduledEventEntityType } from "./ScheduledEventEntityType.js";
import { scheduledEventPrivacyLevelSchema } from "./ScheduledEventPrivacyLevel.js";
import { scheduledEventStatusSchema } from "./ScheduledEventStatus.js";
import { entityMetadataSchema } from "./EntityMetadata.js";
import { scheduledEventRecurrenceRuleSchema } from "./ScheduledEventRecurrenceRule.js";

export const scheduledEventSchema = v.intersect([
  v.object({
    /** the id of the scheduled event */
    id: snowflake,
    /** the guild id which the scheduled event belongs to */
    guildId: snowflake,
    /** the id of the user that created the scheduled event */
    creatorId: v.nullish(snowflake),
    /** the name of the scheduled event (1-100 characters) */
    name: v.pipe(v.string(), v.nonEmpty(), v.maxLength(100)),
    /** the description of the scheduled event (1-1000 characters) */
    description: v.nullish(v.pipe(v.string(), v.nonEmpty(), v.maxLength(1000))),
    /** the time the scheduled event will start */
    scheduledStartTime: timestamp,
    /** the time the scheduled event will end, required if entity_type is EXTERNAL */
    scheduledEndTime: v.nullable(timestamp),
    /** the privacy level of the scheduled event */
    privacyLevel: scheduledEventPrivacyLevelSchema,
    /** the status of the scheduled event */
    status: scheduledEventStatusSchema,
    /** the id of an entity associated with a guild scheduled event */
    entityId: v.nullable(snowflake),
    /** the user that created the scheduled event */
    creator: v.exactOptional(userSchema),
    /** the number of users subscribed to the scheduled event */
    userCount: v.exactOptional(v.pipe(v.number(), v.integer(), v.minValue(0))),
    /** the cover image hash of the scheduled event */
    image: v.nullish(v.pipe(v.string(), v.nonEmpty())),
    /** the definition for how often this event should recur */
    recurrenceRule: v.nullable(scheduledEventRecurrenceRuleSchema)
  }),
  v.variant(`entityType`, [
    v.object({
      /** the type of the scheduled event */
      entityType: v.literal(ScheduledEventEntityType.STAGE_INSTANCE),
      /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
      channelId: snowflake,
      /** additional metadata for the guild scheduled event */
      entityMetadata: v.null_()
    }),
    v.object({
      /** the type of the scheduled event */
      entityType: v.literal(ScheduledEventEntityType.VOICE),
      /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
      channelId: snowflake,
      /** additional metadata for the guild scheduled event */
      entityMetadata: v.null_()
    }),
    v.object({
      /** the type of the scheduled event */
      entityType: v.literal(ScheduledEventEntityType.EXTERNAL),
      /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
      channelId: v.null_(),
      /** the time the scheduled event will end, required if entity_type is EXTERNAL */
      scheduledEndTime: timestamp,
      /** additional metadata for the guild scheduled event */
      entityMetadata: entityMetadataSchema
    })
  ])
]);

export type ScheduledEvent = v.InferOutput<typeof scheduledEventSchema>;
