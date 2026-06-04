import * as v from "valibot";
import { getAsset } from "@discordkit/core/requests/getAsset";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { imageSizes } from "./types/ImageSizes.js";

export const storePageAssetSchema = v.object({
  application: snowflake,
  asset: snowflake,
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const storePageAsset = ({
  application,
  asset,
  format,
  params
}: v.InferOutput<typeof storePageAssetSchema>): string =>
  getAsset(
    `/app-assets/${application}/store/${asset}.${format ?? `png`}`,
    params
  );
