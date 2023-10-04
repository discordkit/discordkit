import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationIconSchema = z.object({
  application: snowflake,
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

export const applicationIcon = ({
  application,
  icon,
  format,
  params
}: z.infer<typeof applicationIconSchema>): string =>
  getAsset(`/app-icons/${application}/${icon}.${format ?? `png`}`, params);
