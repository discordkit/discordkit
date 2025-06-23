import { getAsset, snowflake } from "@discordkit/core";
import { type InferOutput, picklist, object, exactOptional } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationAssetSchema = object({
  application: snowflake,
  asset: snowflake,
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const applicationAsset = ({
  application,
  asset,
  format,
  params
}: InferOutput<typeof applicationAssetSchema>): string =>
  getAsset(`/app-assets/${application}/${asset}.${format ?? `png`}`, params);
