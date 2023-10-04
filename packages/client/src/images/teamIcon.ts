import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const teamIconSchema = z.object({
  team: snowflake,
  icon: z.string().min(1),
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

export const teamIcon = ({
  team,
  icon,
  format,
  params
}: z.infer<typeof teamIconSchema>): string =>
  getAsset(`/team-icons/${team}/${icon}.${format ?? `png`}`, params);
