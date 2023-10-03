import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const storePageAssetSchema = z.object({
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

export const storePageAsset = ({
  application,
  asset,
  format,
  params
}: z.infer<typeof storePageAssetSchema>): string =>
  getAsset(`/app-assets/${application}/store/${asset}.${format}`, params);
