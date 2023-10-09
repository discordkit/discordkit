import {
  array,
  boolean,
  integer,
  minLength,
  minValue,
  number,
  object,
  optional,
  partial,
  string
} from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake
} from "@discordkit/core";
import { localesSchema } from "../application/types/Locales.js";
import { type Guild, guildSchema } from "./types/Guild.js";
import { verificationLevelSchema } from "./types/VerificationLevel.js";
import { defaultMessageNotificationLevelSchema } from "./types/DefaultMessageNotificationLevel.js";
import { explicitContentFilterLevelSchema } from "./types/ExplicitContentFilterLevel.js";
import { guildFeaturesSchema } from "./types/GuildFeatures.js";

export const modifyGuildSchema = object({
  guild: snowflake,
  body: partial(
    object({
      /** guild name */
      name: string([minLength(1)]),
      /** @deprecated guild voice region id */
      region: optional(string([minLength(1)])),
      /** verification level */
      verificationLevel: optional(verificationLevelSchema),
      /** default message notification level */
      defaultMessageNotifications: optional(
        defaultMessageNotificationLevelSchema
      ),
      /** explicit content filter level */
      explicitContentFilter: optional(explicitContentFilterLevelSchema),
      /** id for afk channel */
      afkChannelId: optional(snowflake),
      /** afk timeout in seconds */
      afkTimeout: number([integer(), minValue(0)]),
      /** base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the server has the ANIMATED_ICON feature) */
      icon: optional(string([minLength(1)])),
      /** user id to transfer guild ownership to (must be owner) */
      ownerId: snowflake,
      /** base64 16:9 png/jpeg image for the guild splash (when the server has the INVITE_SPLASH feature) */
      splash: optional(string([minLength(1)])),
      /** base64 16:9 png/jpeg image for the guild discovery splash (when the server has the DISCOVERABLE feature) */
      discoverySplash: optional(string([minLength(1)])),
      /** base64 16:9 png/jpeg image for the guild banner (when the server has the BANNER feature; can be animated gif when the server has the ANIMATED_BANNER feature) */
      banner: optional(string([minLength(1)])),
      /** the id of the channel where guild notices such as welcome messages and boost events are posted */
      systemChannelId: optional(snowflake),
      /** system channel flags */
      systemChannelFlags: number([integer()]),
      /** the id of the channel where Community guilds display rules and/or guidelines */
      rulesChannelId: optional(snowflake),
      /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
      publicUpdatesChannelId: optional(snowflake),
      /** the preferred locale of a Community guild used in server discovery and notices from Discord; defaults to "en-US" */
      preferredLocale: optional(localesSchema),
      /** enabled guild features */
      features: array(guildFeaturesSchema),
      /** the description for the guild */
      description: optional(string([minLength(1)])),
      /** whether the guild's boost progress bar should be enabled */
      premiumProgressBarEnabled: boolean(),
      /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
      safetyAlertsChannelId: optional(snowflake)
    })
  )
});

/**
 * ### [Modify Guild](https://discord.com/developers/docs/resources/guild#modify-guild)
 *
 * **PATCH** `/guilds/:guild`
 *
 * Modify a guild's settings. Requires the `MANAGE_GUILD` permission. Returns the updated {@link Guild | guild object} on success. Fires a Guild Update Gateway event.
 *
 * > **NOTE**
 * >
 * > All parameters to this endpoint are optional
 *
 * > **NOTE**
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * > **WARNING**
 * >
 * > Attempting to add or remove the `COMMUNITY` guild feature requires the `ADMINISTRATOR` permission.
 */
export const modifyGuild: Fetcher<typeof modifyGuildSchema, Guild> = async ({
  guild,
  body
}) => patch(`/guilds/${guild}`, body);

export const modifyGuildSafe = toValidated(
  modifyGuild,
  modifyGuildSchema,
  guildSchema
);

export const modifyGuildProcedure = toProcedure(
  `mutation`,
  modifyGuild,
  modifyGuildSchema,
  guildSchema
);
