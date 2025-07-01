import * as v from "valibot";
import {
  patch,
  type Fetcher,
  toProcedure,
  toValidated,
  snowflake,
  datauri,
  asInteger
} from "@discordkit/core";
import { localesSchema } from "../application/types/Locales.js";
import { type Guild, guildSchema } from "./types/Guild.js";
import { verificationLevelSchema } from "./types/VerificationLevel.js";
import { defaultMessageNotificationLevelSchema } from "./types/DefaultMessageNotificationLevel.js";
import { explicitContentFilterLevelSchema } from "./types/ExplicitContentFilterLevel.js";
import { guildFeaturesSchema } from "./types/GuildFeatures.js";
import { systemChannelFlag } from "./types/SystemChannelFlags.js";

export const modifyGuildSchema = v.object({
  guild: snowflake,
  body: v.partial(
    v.object({
      /** guild name */
      name: v.pipe(v.string(), v.nonEmpty()),
      /** @deprecated guild voice region id */
      region: v.nullable(v.pipe(v.string(), v.nonEmpty())),
      /** verification level */
      verificationLevel: v.nullable(verificationLevelSchema),
      /** default message notification level */
      defaultMessageNotifications: v.nullable(
        defaultMessageNotificationLevelSchema
      ),
      /** explicit content filter level */
      explicitContentFilter: v.nullable(explicitContentFilterLevelSchema),
      /** id for afk channel */
      afkChannelId: v.nullable(snowflake),
      /** afk timeout in seconds */
      afkTimeout: v.pipe(v.number(), v.integer(), v.minValue(0)),
      /** base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the server has the ANIMATED_ICON feature) */
      icon: v.nullable(datauri),
      /** user id to transfer guild ownership to (must be owner) */
      ownerId: snowflake,
      /** base64 16:9 png/jpeg image for the guild splash (when the server has the INVITE_SPLASH feature) */
      splash: v.nullable(datauri),
      /** base64 16:9 png/jpeg image for the guild discovery splash (when the server has the DISCOVERABLE feature) */
      discoverySplash: v.nullable(datauri),
      /** base64 16:9 png/jpeg image for the guild banner (when the server has the BANNER feature; can be animated gif when the server has the ANIMATED_BANNER feature) */
      banner: v.nullable(datauri),
      /** the id of the channel where guild notices such as welcome messages and boost events are posted */
      systemChannelId: v.nullable(snowflake),
      /** system channel flags */
      systemChannelFlags: asInteger(
        systemChannelFlag
      ) as v.GenericSchema<number>,
      /** the id of the channel where Community guilds display rules and/or guidelines */
      rulesChannelId: v.nullable(snowflake),
      /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
      publicUpdatesChannelId: v.nullable(snowflake),
      /** the preferred locale of a Community guild used in server discovery and notices from Discord; defaults to "en-US" */
      preferredLocale: v.nullable(localesSchema),
      /** enabled guild features */
      features: v.array(guildFeaturesSchema),
      /** the description for the guild */
      description: v.nullable(v.pipe(v.string(), v.nonEmpty())),
      /** whether the guild's boost progress bar should be enabled */
      premiumProgressBarEnabled: v.boolean(),
      /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
      safetyAlertsChannelId: v.nullable(snowflake)
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
 * > [!NOTE]
 * >
 * > All parameters to this endpoint are optional
 *
 * > [!NOTE]
 * >
 * > This endpoint supports the `X-Audit-Log-Reason` header.
 *
 * > [!WARNING]
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
