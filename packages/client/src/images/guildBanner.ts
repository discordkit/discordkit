import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const guildBannerSchema = z.object({
  guild: snowflake,
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

export const guildBanner = ({
  guild,
  banner,
  format,
  params
}: z.infer<typeof guildBannerSchema>): string =>
  getAsset(`/banners/${guild}/${banner}.${format}`, params);
