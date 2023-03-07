import type { User } from "../../user";
import type { ScheduledEventEntityType } from "./ScheduledEventEntityType";
import type { ScheduledEventPrivacyLevel } from "./ScheduledEventPrivacyLevel";
import type { ScheduledEventStatus } from "./ScheduledEventStatus";
import type { EntityMetadata } from "./EntityMetadata";

export interface ScheduledEvent {
  /** the id of the scheduled event */
  id: string;
  /** the guild id which the scheduled event belongs to */
  guildId: string;
  /** the channel id in which the scheduled event will be hosted, or null if scheduled entity type is EXTERNAL */
  channelId?: string;
  /** the id of the user that created the scheduled event */
  creatorId?: string;
  /** the name of the scheduled event (1-100 characters) */
  name: string;
  /** the description of the scheduled event (1-1000 characters) */
  description?: string;
  /** the time the scheduled event will start */
  scheduledStartTime: string;
  /** the time the scheduled event will end, required if entity_type is EXTERNAL */
  scheduledEndTime?: string;
  /** the privacy level of the scheduled event */
  privacyLevel: ScheduledEventPrivacyLevel;
  /** the status of the scheduled event */
  status: ScheduledEventStatus;
  /** the type of the scheduled event */
  entityType: ScheduledEventEntityType;
  /** the id of an entity associated with a guild scheduled event */
  entityId?: string;
  /** additional metadata for the guild scheduled event */
  entityMetadata?: EntityMetadata;
  /** the user that created the scheduled event */
  creator?: User;
  /** the number of users subscribed to the scheduled event */
  userCount?: number;
  /** the cover image hash of the scheduled event */
  image?: string;
}
