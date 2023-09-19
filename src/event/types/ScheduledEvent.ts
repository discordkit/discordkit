import { z } from "zod";
import { userSchema } from "../../user/types/User";
import { scheduledEventEntityTypeSchema } from "./ScheduledEventEntityType";
import { scheduledEventPrivacyLevelSchema } from "./ScheduledEventPrivacyLevel";
import { scheduledEventStatusSchema } from "./ScheduledEventStatus";
import { entityMetadataSchema } from "./EntityMetadata";

export const scheduledEventSchema = z.object({
  /** the id of the scheduled event */
  id: z.string(),
  /** the guild id which the scheduled event belongs to */
  guildId: z.string(),
  /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
  channelId: z.string().optional(),
  /** the id of the user that created the scheduled event */
  creatorId: z.string().optional(),
  /** the name of the scheduled event (1-100 characters) */
  name: z.string(),
  /** the description of the scheduled event (1-1000 characters) */
  description: z.string().optional(),
  /** the time the scheduled event will start */
  scheduledStartTime: z.string(),
  /** the time the scheduled event will end, required if entity_type is EXTERNAL */
  scheduledEndTime: z.string().optional(),
  /** the privacy level of the scheduled event */
  privacyLevel: scheduledEventPrivacyLevelSchema,
  /** the status of the scheduled event */
  status: scheduledEventStatusSchema,
  /** the type of the scheduled event */
  entityType: scheduledEventEntityTypeSchema,
  /** the id of an entity associated with a guild scheduled event */
  entityId: z.string().optional(),
  /** additional metadata for the guild scheduled event */
  entityMetadata: entityMetadataSchema.optional(),
  /** the user that created the scheduled event */
  creator: userSchema.optional(),
  /** the number of users subscribed to the scheduled event */
  userCount: z.number().optional(),
  /** the cover image hash of the scheduled event */
  image: z.string().optional()
});

export type ScheduledEvent = z.infer<typeof scheduledEventSchema>;
