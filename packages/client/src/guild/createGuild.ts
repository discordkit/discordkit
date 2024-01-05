import {
  array,
  integer,
  maxLength,
  minLength,
  minValue,
  nullish,
  number,
  object,
  optional,
  partial,
  string
} from "valibot";
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

export const createGuildSchema = object({
  body: object({
    /** name of the guild (2-100 characters) */
    name: string([minLength(2), maxLength(100)]),
    /** @deprecated voice region id */
    region: nullish(string([minLength(1)])),
    /** icon hash */
    icon: nullish(string([minLength(1)])),
    /** verification level */
    verificationLevel: nullish(verificationLevelSchema),
    /** default message notification level */
    defaultMessageNotifications: nullish(defaultMessageNotificationLevelSchema),
    /** explicit content filter level */
    explicitContentFilter: nullish(explicitContentFilterLevelSchema),
    /** new guild roles */
    roles: nullish(array(roleSchema)),
    /** new guild's channels */
    channels: nullish(array(partial(channelSchema))),
    /** id for afk channel */
    afkChannelId: nullish(snowflake),
    /** afk timeout in seconds */
    afkTimeout: nullish(number([integer(), minValue(0)])),
    /** the id of the channel where guild notices such as welcome messages and boost events are posted */
    systemChannelId: nullish(snowflake),
    /** system channel flags */
    systemChannelFlags: optional(number([integer(), minValue(0)]))
  })
});

/**
 * ### [Create Guild](https://discord.com/developers/docs/resources/guild#create-guild)
 *
 * **POST** `/guilds`
 *
 * Create a new guild. Returns a {@link Guild | guild object} on success. Fires a Guild Create Gateway event.
 *
 * > [!WARNING]
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
