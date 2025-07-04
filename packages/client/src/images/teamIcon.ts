import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const teamIconSchema = v.object({
  team: snowflake,
  icon: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const teamIcon = ({
  team,
  icon,
  format,
  params
}: v.InferOutput<typeof teamIconSchema>): string =>
  getAsset(`/team-icons/${team}/${icon}.${format ?? `png`}`, params);
