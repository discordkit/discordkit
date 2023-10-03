import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const roleIconSchema = z.object({
  role: snowflake,
  icon: z.string().min(1),
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

export const roleIcon = ({
  role,
  icon,
  format,
  params
}: z.infer<typeof roleIconSchema>): string =>
  getAsset(`/role-icons/${role}/${icon}.${format}`, params);
