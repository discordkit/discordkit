import {
  array,
  integer,
  maxLength,
  minLength,
  nonEmpty,
  minValue,
  nullish,
  number,
  object,
  string,
  pipe,
  exactOptional,
  type GenericSchema
} from "valibot";
import {
  post,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  datauri,
  asInteger
} from "@discordkit/core";
import { channelSchema } from "../channel/types/Channel.js";
import { verificationLevelSchema } from "./types/VerificationLevel.js";
import { defaultMessageNotificationLevelSchema } from "./types/DefaultMessageNotificationLevel.js";
import { explicitContentFilterLevelSchema } from "./types/ExplicitContentFilterLevel.js";
import { roleSchema } from "../permissions/Role.js";
import { guildSchema, type Guild } from "./types/Guild.js";
import { systemChannelFlag } from "./types/SystemChannelFlags.js";

export const createGuildSchema = object({
  body: object({
    /** name of the guild (2-100 characters) */
    name: pipe(string(), minLength(2), maxLength(100)),
    /** @deprecated voice region id */
    region: nullish(pipe(string(), nonEmpty())),
    /** icon hash */
    icon: exactOptional(datauri),
    /** verification level */
    verificationLevel: exactOptional(verificationLevelSchema),
    /** default message notification level */
    defaultMessageNotifications: exactOptional(
      defaultMessageNotificationLevelSchema
    ),
    /** explicit content filter level */
    explicitContentFilter: exactOptional(explicitContentFilterLevelSchema),
    /** new guild roles */
    roles: exactOptional(array(roleSchema)),
    /** new guild's channels */
    channels: exactOptional(array(channelSchema)),
    /** id for afk channel */
    afkChannelId: exactOptional(snowflake),
    /** afk timeout in seconds */
    afkTimeout: exactOptional(pipe(number(), integer(), minValue(0))),
    /** the id of the channel where guild notices such as welcome messages and boost events are posted */
    systemChannelId: exactOptional(snowflake),
    /** system channel flags */
    systemChannelFlags: exactOptional(
      asInteger(systemChannelFlag) as GenericSchema<number>
    )
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
