import { z } from "zod";
import { patch, type Fetcher, toProcedure } from "../utils";
import {
  guildFeaturesSchema,
  defaultMessageNotificationLevelSchema,
  explicitContentFilterLevelSchema,
  verificationLevelSchema,
  systemChannelFlagsSchema,
  type Guild,
  guildSchema
} from "./types";

export const modifyGuildSchema = z.object({
  guild: z.string().min(1),
  body: z
    .object({
      /** guild name */
      name: z.string().min(1),
      /** @deprecated guild voice region id */
      region: z.string().min(1).nullable(),
      /** verification level */
      verificationLevel: verificationLevelSchema.nullable(),
      /** default message notification level */
      defaultMessageNotifications:
        defaultMessageNotificationLevelSchema.nullable(),
      /** explicit content filter level */
      explicitContentFilter: explicitContentFilterLevelSchema.nullable(),
      /** id for afk channel */
      afkChannelId: z.string().min(1).nullable(),
      /** afk timeout in seconds */
      afkTimeout: z.number().positive(),
      /** base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the server has the ANIMATED_ICON feature) */
      icon: z.string().min(1).nullable(),
      /** user id to transfer guild ownership to (must be owner) */
      ownerId: z.string().min(1),
      /** base64 16:9 png/jpeg image for the guild splash (when the server has the INVITE_SPLASH feature) */
      splash: z.string().min(1).nullable(),
      /** base64 16:9 png/jpeg image for the guild discovery splash (when the server has the DISCOVERABLE feature) */
      discoverySplash: z.string().min(1).nullable(),
      /** base64 16:9 png/jpeg image for the guild banner (when the server has the BANNER feature; can be animated gif when the server has the ANIMATED_BANNER feature) */
      banner: z.string().min(1).nullable(),
      /** the id of the channel where guild notices such as welcome messages and boost events are posted */
      systemChannelId: z.string().min(1).nullable(),
      /** system channel flags */
      systemChannelFlags: systemChannelFlagsSchema,
      /** the id of the channel where Community guilds display rules and/or guidelines */
      rulesChannelId: z.string().min(1).nullable(),
      /** the id of the channel where admins and moderators of Community guilds receive notices from Discord */
      publicUpdatesChannelId: z.string().min(1).nullable(),
      /** the preferred locale of a Community guild used in server discovery and notices from Discord; defaults to "en-US" */
      preferredLocale: z.string().min(1).nullable(),
      /** enabled guild features */
      features: guildFeaturesSchema.array(),
      /** the description for the guild */
      description: z.string().min(1).nullable(),
      /** whether the guild's boost progress bar should be enabled */
      premiumProgressBarEnabled: z.boolean()
    })
    .partial()
});

/**
 * Modify a guild's settings. Requires the `MANAGE_GUILD` permission. Returns the updated guild object on success. Fires a [Guild Update](https://discord.com/developers/docs/topics/gateway#guild-update) Gateway event.
 *
 * *This endpoint supports the `X-Audit-Log-Reason` header.*
 *
 * *Attempting to add or remove the `COMMUNITY` guild feature requires the `ADMINISTRATOR` permission.*
 *
 * https://discord.com/developers/docs/resources/guild#modify-guild
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
