import * as v from "valibot";
import { getAsset } from "@discordkit/core/requests/getAsset";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationCoverSchema = v.object({
  application: snowflake,
  cover: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const applicationCover = ({
  application,
  cover,
  format,
  params
}: v.InferOutput<typeof applicationCoverSchema>): string =>
  getAsset(`/app-icons/${application}/${cover}.${format ?? `png`}`, params);
