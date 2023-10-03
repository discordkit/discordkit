import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const userBannerSchema = z.object({
  user: snowflake,
  banner: z.string().min(1),
  format: z
    .union([
      z.literal(`png`),
      z.literal(`jpg`),
      z.literal(`webp`),
      z.literal(`gif`)
    ])
    .optional()
    .default(`png`),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const userBanner = ({
  user,
  banner,
  format,
  params
}: z.infer<typeof userBannerSchema>): string =>
  getAsset(`/banners/${user}/${banner}.${format}`, params);
