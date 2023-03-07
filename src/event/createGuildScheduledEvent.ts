import { z } from "zod";
import { mutation, post } from "../utils";
import { entityMetadata, ScheduledEventEntityType, ScheduledEventPrivacyLevel, type ScheduledEvent } from "./types";

export const createGuildScheduledEventSchema = z.object({
  guild: z.string().min(1),
  body: z.object({
    /** the channel id of the scheduled event. */
    channelId: z.string().min(1).optional(),
    /** entity metadata	the entity metadata of the scheduled event */
    entityMetadata,
    /** the name of the scheduled event */
    name: z.string().min(1),
    /** the privacy level of the scheduled event */
    privacyLevel: z.nativeEnum(ScheduledEventPrivacyLevel),
    /** the time to schedule the scheduled event */
    scheduledStartTime: z.string().min(1),
    /** the time when the scheduled event is scheduled to end */
    scheduledEndTime: z.string().min(1).optional(),
    /** the description of the scheduled event */
    description: z.string().min(1).optional(),
    /** the entity type of the scheduled event */
    entityType: z.nativeEnum(ScheduledEventEntityType),
    /** the cover image of the scheduled event */
    image: z.string().min(1).optional()
  })
});

/**
 * Create a guild scheduled event in the guild. Returns a guild scheduled event object on success.
 *
 * *A guild can have a maximum of 100 events with `SCHEDULED` or `ACTIVE` status at any time.*
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * https://discord.com/developers/docs/resources/guild-scheduled-event#create-guild-scheduled-event
 */
export const createGuildScheduledEvent = mutation(createGuildScheduledEventSchema, async ({ guild, body }) =>
  post<ScheduledEvent>(`/guilds/${guild}/scheduled-events`, body)
);
