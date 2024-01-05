import { getAsset, snowflake } from "@discordkit/core";
import { type Output, object, optional, picklist } from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const storePageAssetSchema = object({
  application: snowflake,
  asset: snowflake,
  format: optional(picklist([`png`, `jpg`, `webp`]), `png`),
  params: optional(
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
}: Output<typeof storePageAssetSchema>): string =>
  getAsset(
    `/app-assets/${application}/store/${asset}.${format ?? `png`}`,
    params
  );
