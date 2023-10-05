import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const achievementIconSchema = z.object({
  application: snowflake,
  achievement: snowflake,
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

export const achievementIcon = ({
  application,
  achievement,
  icon,
  format,
  params
}: z.infer<typeof achievementIconSchema>): string =>
  getAsset(
    `/app-assets/${application}
/achievements/${achievement}/icons/${icon}.${format ?? `png`}`,
    params
  );
