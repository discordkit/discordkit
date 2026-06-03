import * as v from "valibot";
import { getAsset } from "@discordkit/core/requests/getAsset";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { imageSizes } from "./types/ImageSizes.js";

export const guildTagBadgeSchema = v.object({
  guild: snowflake,
  /**
   * The server-tag badge hash. Read from `User.primaryGuild.badge` on
   * any user displaying this guild's tag.
   */
  badge: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

/**
 * Returns a CDN URL for the server-tag badge of a guild.
 *
 * See [CDN Endpoints — Guild Tag Badge](https://discord.com/developers/docs/reference#image-formatting-cdn-endpoints).
 */
export const guildTagBadge = ({
  guild,
  badge,
  format,
  params
}: v.InferOutput<typeof guildTagBadgeSchema>): string =>
  getAsset(`/guild-tag-badges/${guild}/${badge}.${format ?? `png`}`, params);
