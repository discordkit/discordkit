import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  object,
  exactOptional,
  string,
  picklist,
  pipe,
  nonEmpty
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const teamIconSchema = object({
  team: snowflake,
  icon: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const teamIcon = ({
  team,
  icon,
  format,
  params
}: InferOutput<typeof teamIconSchema>): string =>
  getAsset(`/team-icons/${team}/${icon}.${format ?? `png`}`, params);
