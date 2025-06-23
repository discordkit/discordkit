import { getAsset, snowflake } from "@discordkit/core";
import { type InferOutput, object, exactOptional, picklist } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const storePageAssetSchema = object({
  application: snowflake,
  asset: snowflake,
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const storePageAsset = ({
  application,
  asset,
  format,
  params
}: InferOutput<typeof storePageAssetSchema>): string =>
  getAsset(
    `/app-assets/${application}/store/${asset}.${format ?? `png`}`,
    params
  );
