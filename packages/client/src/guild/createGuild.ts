import { z } from "zod";
import { post, type Fetcher, toProcedure, toValidated } from "@discordkit/core";
import { channelSchema } from "#/channel/types/Channel.ts";
import { verificationLevelSchema } from "./types/VerificationLevel.ts";
import { defaultMessageNotificationLevelSchema } from "./types/DefaultMessageNotificationLevel.ts";
import { explicitContentFilterLevelSchema } from "./types/ExplicitContentFilterLevel.ts";
import { roleSchema } from "./types/Role.ts";
import { guildSchema, type Guild } from "./types/Guild.ts";

export const createGuildSchema = z.object({
  body: z.object({
    /** name of the guild (2-100 characters) */
    name: z.string().min(2).max(100),
    /** @deprecated voice region id */
    region: z.string().min(1).nullable().optional(),
    /** icon hash */
    icon: z.string().min(1).nullable(),
    /** verification level */
    verificationLevel: verificationLevelSchema.nullable(),
    /** default message notification level */
    defaultMessageNotifications:
      defaultMessageNotificationLevelSchema.nullable(),
    /** explicit content filter level */
    explicitContentFilter: explicitContentFilterLevelSchema.nullable(),
    /** new guild roles */
    roles: roleSchema.array().nullable(),
    /** new guild's channels */
    channels: channelSchema.partial().array().nullable(),
    /** id for afk channel */
    afkChannelId: z.string().min(1).nullable(),
    /** afk timeout in seconds */
    afkTimeout: z.number().int().positive().nullable(),
    /** the id of the channel where guild notices such as welcome messages and boost events are posted */
    systemChannelId: z.string().min(1).nullable(),
    /** system channel flags */
    systemChannelFlags: z.number().int().optional()
  })
});

/**
 * ### [Create Guild](https://discord.com/developers/docs/resources/guild#create-guild)
 *
 * **POST** `/guilds`
 *
 * Create a new guild. Returns a {@link Guild | guild object} on success. Fires a Guild Create Gateway event.
 *
 * > **WARNING**
 * >
 * > This endpoint can be used only by bots in less than 10 guilds.
 */
export const createGuild: Fetcher<typeof createGuildSchema, Guild> = async ({
  body
}) => post(`/guilds`, body);

export const createGuildSafe = toValidated(
  createGuild,
  createGuildSchema,
  guildSchema
);

export const createGuildProcedure = toProcedure(
  `mutation`,
  createGuild,
  createGuildSchema,
  guildSchema
);
