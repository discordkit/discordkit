import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationCoverSchema = z.object({
  application: snowflake,
  cover: z.string().min(1),
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

export const applicationCover = ({
  application,
  cover,
  format,
  params
}: z.infer<typeof applicationCoverSchema>): string =>
  getAsset(`/app-icons/${application}/${cover}.${format ?? `png`}`, params);
