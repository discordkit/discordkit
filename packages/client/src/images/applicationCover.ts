import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  picklist,
  minLength,
  object,
  optional,
  string
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const applicationCoverSchema = object({
  application: snowflake,
  cover: string([minLength(1)]),
  format: optional(picklist([`png`, `jpg`, `webp`]), `png`),
  params: optional(
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
}: Output<typeof applicationCoverSchema>): string =>
  getAsset(`/app-icons/${application}/${cover}.${format ?? `png`}`, params);
