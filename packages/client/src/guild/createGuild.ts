import * as v from "valibot";
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

export const createGuildSchema = v.object({
  body: v.object({
    /** name of the guild (2-100 characters) */
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
    /** @deprecated voice region id */
    region: v.nullish(v.pipe(v.string(), v.nonEmpty())),
    /** icon hash */
    icon: v.exactOptional(datauri),
    /** verification level */
    verificationLevel: v.exactOptional(verificationLevelSchema),
    /** default message notification level */
    defaultMessageNotifications: v.exactOptional(
      defaultMessageNotificationLevelSchema
    ),
    /** explicit content filter level */
    explicitContentFilter: v.exactOptional(explicitContentFilterLevelSchema),
    /** new guild roles */
    roles: v.exactOptional(v.array(roleSchema)),
    /** new guild's channels */
    channels: v.exactOptional(v.array(channelSchema)),
    /** id for afk channel */
    afkChannelId: v.exactOptional(snowflake),
    /** afk timeout in seconds */
    afkTimeout: v.exactOptional(v.pipe(v.number(), v.integer(), v.minValue(0))),
    /** the id of the channel where guild notices such as welcome messages and boost events are posted */
    systemChannelId: v.exactOptional(snowflake),
    /** system channel flags */
    systemChannelFlags: v.exactOptional(
      asInteger(systemChannelFlag) as v.GenericSchema<number>
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
