import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildBannerSchema = v.object({
  guild: snowflake,
  banner: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`, `gif`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const guildBanner = ({
  guild,
  banner,
  format,
  params
}: v.InferOutput<typeof guildBannerSchema>): string =>
  getAsset(`/banners/${guild}/${banner}.${format ?? `png`}`, params);
