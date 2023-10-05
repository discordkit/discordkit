import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const stickerPackBannerSchema = z.object({
  banner: snowflake,
  format: z
    .union([z.literal(`png`), z.literal(`jpg`), z.literal(`webp`)])
    .default(`png`)
    .optional(),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const stickerPackBanner = ({
  banner,
  format,
  params
}: z.infer<typeof stickerPackBannerSchema>): string =>
  getAsset(
    `/app-assets/710982414301790216/store/${banner}.${format ?? `png`}`,
    params
  );
