import {
  type Output,
  object,
  optional,
  string,
  number,
  nullish,
  isoTimestamp,
  integer,
  minValue
} from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { scheduledEventEntityTypeSchema } from "./ScheduledEventEntityType.js";
import { scheduledEventPrivacyLevelSchema } from "./ScheduledEventPrivacyLevel.js";
import { scheduledEventStatusSchema } from "./ScheduledEventStatus.js";
import { entityMetadataSchema } from "./EntityMetadata.js";

export const scheduledEventSchema = object({
  /** the id of the scheduled event */
  id: snowflake,
  /** the guild id which the scheduled event belongs to */
  guildId: snowflake,
  /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
  channelId: optional(snowflake),
  /** the id of the user that created the scheduled event */
  creatorId: optional(snowflake),
  /** the name of the scheduled event (1-100 characters) */
  name: string(),
  /** the description of the scheduled event (1-1000 characters) */
  description: nullish(string()),
  /** the time the scheduled event will start */
  scheduledStartTime: string([isoTimestamp()]),
  /** the time the scheduled event will end, required if entity_type is EXTERNAL */
  scheduledEndTime: optional(string([isoTimestamp()])),
  /** the privacy level of the scheduled event */
  privacyLevel: scheduledEventPrivacyLevelSchema,
  /** the status of the scheduled event */
  status: scheduledEventStatusSchema,
  /** the type of the scheduled event */
  entityType: scheduledEventEntityTypeSchema,
  /** the id of an entity associated with a guild scheduled event */
  entityId: optional(snowflake),
  /** additional metadata for the guild scheduled event */
  entityMetadata: optional(entityMetadataSchema),
  /** the user that created the scheduled event */
  creator: nullish(userSchema),
  /** the number of users subscribed to the scheduled event */
  userCount: nullish(number([integer(), minValue(0)])),
  /** the cover image hash of the scheduled event */
  image: nullish(string())
});

export type ScheduledEvent = Output<typeof scheduledEventSchema>;
