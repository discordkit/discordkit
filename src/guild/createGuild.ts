import { z } from "zod";
import { post, type Fetcher } from "../utils";
import { channel } from "../channel";
import {
  role,
  type Guild,
  explicitContentFilterLevel,
  defaultMessageNotificationLevel,
  verificationLevel,
  systemChannelFlags
} from "./types";

export const createGuildSchema = z.object({
  body: z.object({
    /** name of the guild (2-100 characters) */
    name: z.string().min(2).max(100),
    /** voice region id (deprecated) */
    region: z.string().min(1).nullable(),
    /** icon hash */
    icon: z.string().min(1).optional(),
    /** verification level */
    verificationLevel: verificationLevel.optional(),
    /** default message notification level */
    defaultMessageNotifications: defaultMessageNotificationLevel.optional(),
    /** explicit content filter level */
    explicitContentFilter: explicitContentFilterLevel.optional(),
    /** new guild roles */
    roles: role.array().optional(),
    /** new guild's channels */
    channels: channel.partial().array().optional(),
    /** id for afk channel */
    afkChannelId: z.string().min(1).optional(),
    /** afk timeout in seconds */
    afkTimeout: z.number().positive().optional(),
    /** the id of the channel where guild notices such as welcome messages and boost events are posted */
    systemChannelId: z.string().min(1).optional(),
    /** system channel flags */
    systemChannelFlags: systemChannelFlags.optional()
  })
});

/**
 * Create a new guild. Returns a guild object on success. Fires a Guild Create Gateway event.
 *
 * *This endpoint can be used only by bots in less than 10 guilds.*
 *
 * https://discord.com/developers/docs/resources/guild#create-guild
 */
export const createGuild: Fetcher<typeof createGuildSchema, Guild> = async ({
  body
}) => post(`/guilds`, body);
