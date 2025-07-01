import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const stickerPackBannerSchema = v.object({
  banner: snowflake,
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const stickerPackBanner = ({
  banner,
  format,
  params
}: v.InferOutput<typeof stickerPackBannerSchema>): string =>
  getAsset(
    `/app-assets/710982414301790216/store/${banner}.${format ?? `png`}`,
    params
  );
