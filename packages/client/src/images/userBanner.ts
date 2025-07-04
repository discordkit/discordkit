import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const userBannerSchema = v.object({
  user: snowflake,
  banner: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`, `gif`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const userBanner = ({
  user,
  banner,
  format,
  params
}: v.InferOutput<typeof userBannerSchema>): string =>
  getAsset(`/banners/${user}/${banner}.${format ?? `png`}`, params);
