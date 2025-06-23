import { getAsset, snowflake } from "@discordkit/core";
import { type InferOutput, object, exactOptional, picklist } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const stickerPackBannerSchema = object({
  banner: snowflake,
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const stickerPackBanner = ({
  banner,
  format,
  params
}: InferOutput<typeof stickerPackBannerSchema>): string =>
  getAsset(
    `/app-assets/710982414301790216/store/${banner}.${format ?? `png`}`,
    params
  );
