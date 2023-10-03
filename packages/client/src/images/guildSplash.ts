import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const guildSplashSchema = z.object({
  guild: snowflake,
  splash: z.string().min(1),
  format: z
    .union([z.literal(`png`), z.literal(`jpg`), z.literal(`webp`)])
    .optional()
    .default(`png`),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const guildSplash = ({
  guild,
  splash,
  format,
  params
}: z.infer<typeof guildSplashSchema>): string =>
  getAsset(`/splashes/${guild}/${splash}.${format}`, params);
