import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const guildDiscoverySplashSchema = z.object({
  guild: snowflake,
  splash: z.string().min(1),
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

export const guildDiscoverySplash = ({
  guild,
  splash,
  format,
  params
}: z.infer<typeof guildDiscoverySplashSchema>): string =>
  getAsset(`/discovery-splashes/${guild}/${splash}.${format ?? `png`}`, params);
