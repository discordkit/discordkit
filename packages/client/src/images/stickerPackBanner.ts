import { getAsset, snowflake } from "@discordkit/core";
import { type Output, object, optional, picklist } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const stickerPackBannerSchema = object({
  banner: snowflake,
  format: optional(picklist([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const stickerPackBanner = ({
  banner,
  format,
  params
}: Output<typeof stickerPackBannerSchema>): string =>
  getAsset(
    `/app-assets/710982414301790216/store/${banner}.${format ?? `png`}`,
    params
  );
