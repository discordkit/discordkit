import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import { type Guild, guildSchema } from "./types/Guild";
import { verificationLevelSchema } from "./types/VerificationLevel";
import { defaultMessageNotificationLevelSchema } from "./types/DefaultMessageNotificationLevel";
import { explicitContentFilterLevelSchema } from "./types/ExplicitContentFilterLevel";
import { guildFeaturesSchema } from "./types/GuildFeatures";
import { localesSchema } from "../application";

export const modifyGuildSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** guild name */
      name: z.string().min(1),
      /** @deprecated guild voice region id */
      region: z.string().min(1).optional(),
      /** verification level */
      verificationLevel: verificationLevelSchema.optional(),
      /** default message notification level */
      defaultMessageNotifications:
        defaultMessageNotificationLevelSchema.optional(),
      /** explicit content filter level */
      explicitContentFilter: explicitContentFilterLevelSchema.optional(),
      /** id for afk channel */
      afkChannelId: z.string().min(1).optional(),
      /** afk timeout in seconds */
      afkTimeout: z.number().int().positive(),
      /** base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the server has the ANIMATED_ICON feature) */
      icon: z.string().min(1).optional(),
      /** user id to transfer guild ownership to (must be owner) */
      ownerId: z.string().min(1),
      /** base64 16:9 png/jpeg image for the guild splash (when the server has the INVITE_SPLASH feature) */
      splash: z.string().min(1).optional(),
      /** base64 16:9 png/jpeg image for the guild discovery splash (when the server has the DISCOVERABLE feature) */
      discoverySplash: z.string().min(1).optional(),
      /** base64 16:9 png/jpeg image for the guild banner (when the server has the BANNER feature; can be animated gif when the server has the ANIMATED_BANNER feature) */
      banner: z.string().min(1).optional(),
      /** the id of the channel where guild notices such as welcome messages and boost events are posted */
      systemChannelId: z.string().min(1).optional(),
      /** system channel flags */
      systemChannelFlags: z.number().int(),
      /** the id of the channel where Community guilds display rules and/or guidelines */
      rulesChannelId: z.string().min(1).optional(),
      /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
      publicUpdatesChannelId: z.string().min(1).optional(),
      /** the preferred locale of a Community guild used in server discovery and notices from Discord; defaults to "en-US" */
      preferredLocale: localesSchema.optional(),
      /** enabled guild features */
      features: guildFeaturesSchema.array(),
      /** the description for the guild */
      description: z.string().min(1).optional(),
      /** whether the guild's boost progress bar should be enabled */
      premiumProgressBarEnabled: z.boolean(),
      /** the id of the channel where admins and moderators of Community guilds receive safety alerts from Discord */
      safetyAlertsChannelId: z.string().min(1).optional()
    })
    .partial()
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

export const modifyGuildProcedure = toProcedure(
  `mutation`,
  modifyGuild,
  modifyGuildSchema,
  guildSchema
);
