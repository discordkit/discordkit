import { z } from "zod";
import { userSchema } from "#/user/types/User.ts";
import { snowflake } from "@discordkit/core";
import { scheduledEventEntityTypeSchema } from "./ScheduledEventEntityType.ts";
import { scheduledEventPrivacyLevelSchema } from "./ScheduledEventPrivacyLevel.ts";
import { scheduledEventStatusSchema } from "./ScheduledEventStatus.ts";
import { entityMetadataSchema } from "./EntityMetadata.ts";

export const scheduledEventSchema = z.object({
  /** the id of the scheduled event */
  id: snowflake,
  /** the guild id which the scheduled event belongs to */
  guildId: snowflake,
  /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
  channelId: snowflake.optional(),
  /** the id of the user that created the scheduled event */
  creatorId: snowflake.optional(),
  /** the name of the scheduled event (1-100 characters) */
  name: z.string(),
  /** the description of the scheduled event (1-1000 characters) */
  description: z.string().nullable().optional(),
  /** the time the scheduled event will start */
  scheduledStartTime: z.string().datetime(),
  /** the time the scheduled event will end, required if entity_type is EXTERNAL */
  scheduledEndTime: z.string().datetime().optional(),
  /** the privacy level of the scheduled event */
  privacyLevel: scheduledEventPrivacyLevelSchema,
  /** the status of the scheduled event */
  status: scheduledEventStatusSchema,
  /** the type of the scheduled event */
  entityType: scheduledEventEntityTypeSchema,
  /** the id of an entity associated with a guild scheduled event */
  entityId: snowflake.optional(),
  /** additional metadata for the guild scheduled event */
  entityMetadata: entityMetadataSchema.optional(),
  /** the user that created the scheduled event */
  creator: userSchema.nullable(),
  /** the number of users subscribed to the scheduled event */
  userCount: z.number().int().positive().nullable(),
  /** the cover image hash of the scheduled event */
  image: z.string().nullable().optional()
});

export type ScheduledEvent = z.infer<typeof scheduledEventSchema>;
