import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  picklist,
  object,
  exactOptional,
  string,
  pipe,
  nonEmpty
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationCoverSchema = object({
  application: snowflake,
  cover: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const applicationCover = ({
  application,
  cover,
  format,
  params
}: InferOutput<typeof applicationCoverSchema>): string =>
  getAsset(`/app-icons/${application}/${cover}.${format ?? `png`}`, params);
