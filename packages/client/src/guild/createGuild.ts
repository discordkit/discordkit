import { z } from "zod";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { channelSchema } from "../channel/types/Channel.js";
import { verificationLevelSchema } from "./types/VerificationLevel.js";
import { defaultMessageNotificationLevelSchema } from "./types/DefaultMessageNotificationLevel.js";
import { explicitContentFilterLevelSchema } from "./types/ExplicitContentFilterLevel.js";
import { roleSchema } from "./types/Role.js";
import { guildSchema, type Guild } from "./types/Guild.js";

export const createGuildSchema = z.object({
  body: z.object({
    /** name of the guild (2-100 characters) */
    name: z.string().min(2).max(100),
    /** @deprecated voice region id */
    region: z.string().min(1).nullish(),
    /** icon hash */
    icon: z.string().min(1).nullish(),
    /** verification level */
    verificationLevel: verificationLevelSchema.nullish(),
    /** default message notification level */
    defaultMessageNotifications:
      defaultMessageNotificationLevelSchema.nullish(),
    /** explicit content filter level */
    explicitContentFilter: explicitContentFilterLevelSchema.nullish(),
    /** new guild roles */
    roles: roleSchema.array().nullish(),
    /** new guild's channels */
    channels: channelSchema.partial().array().nullish(),
    /** id for afk channel */
    afkChannelId: snowflake.nullish(),
    /** afk timeout in seconds */
    afkTimeout: z.number().int().positive().nullish(),
    /** the id of the channel where guild notices such as welcome messages and boost events are posted */
    systemChannelId: snowflake.nullish(),
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
