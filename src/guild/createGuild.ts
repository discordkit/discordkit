import { z } from "zod";
import { post, type Fetcher, createProcedure } from "../utils";
import { channelSchema } from "../channel";
import {
  roleSchema,
  guildSchema,
  type Guild,
  explicitContentFilterLevelSchema,
  defaultMessageNotificationLevelSchema,
  verificationLevelSchema,
  systemChannelFlagsSchema
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
    verificationLevel: verificationLevelSchema.optional(),
    /** default message notification level */
    defaultMessageNotifications:
      defaultMessageNotificationLevelSchema.optional(),
    /** explicit content filter level */
    explicitContentFilter: explicitContentFilterLevelSchema.optional(),
    /** new guild roles */
    roles: roleSchema.array().optional(),
    /** new guild's channels */
    channels: channelSchema.partial().array().optional(),
    /** id for afk channel */
    afkChannelId: z.string().min(1).optional(),
    /** afk timeout in seconds */
    afkTimeout: z.number().positive().optional(),
    /** the id of the channel where guild notices such as welcome messages and boost events are posted */
    systemChannelId: z.string().min(1).optional(),
    /** system channel flags */
    systemChannelFlags: systemChannelFlagsSchema.optional()
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

export const createGuildProcedure = createProcedure(
  `mutation`,
  createGuild,
  createGuildSchema,
  guildSchema
);
