import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const applicationAssetSchema = z.object({
  application: snowflake,
  asset: snowflake,
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

export const applicationAsset = ({
  application,
  asset,
  format,
  params
}: z.infer<typeof applicationAssetSchema>): string =>
  getAsset(`/app-assets/${application}/${asset}.${format}`, params);
