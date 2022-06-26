import { z } from "zod";
import type { Member } from "../guild";
import type { User } from "../user/types";

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

export enum ScheduledEventPrivacyLevel {
  /** the scheduled event is only accessible to guild members */
  GUILD_ONLY = 2
}

export enum ScheduledEventStatus {
  SCHEDULED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELED = 4
}

export enum ScheduledEventEntityType {
  STAGE_INSTANCE = 1,
  VOICE = 2,
  EXTERNAL = 3
}

export interface ScheduledEventUser {
  /** the scheduled event id which the user subscribed to */
  guildScheduledEventId: string;
  /** user which subscribed to an event */
  user: User;
  /** guild member data for this user for the guild which this event belongs to, if any */
  member?: Member;
}

export const entityMetadata = z.object({
  /** location of the event (1-100 characters) */
  location: z.string().min(1).max(100).optional()
});

export type EntityMetadata = z.infer<typeof entityMetadata>;
