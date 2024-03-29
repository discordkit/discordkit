import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const guildIconSchema = z.object({
  guild: snowflake,
  icon: z.string().min(1),
  format: z
    .union([
      z.literal(`png`),
      z.literal(`jpg`),
      z.literal(`webp`),
      z.literal(`gif`)
    ])
    .default(`png`)
    .optional(),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const guildIcon = ({
  guild,
  icon,
  format,
  params
}: z.infer<typeof guildIconSchema>): string =>
  getAsset(`/icons/${guild}/${icon}.${format ?? `png`}`, params);
