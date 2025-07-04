import * as v from "valibot";
import { getAsset, snowflake, boundedString } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildIconSchema = v.object({
  guild: snowflake,
  icon: boundedString(),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`, `gif`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const guildIcon = ({
  guild,
  icon,
  format,
  params
}: v.InferOutput<typeof guildIconSchema>): string =>
  getAsset(`/icons/${guild}/${icon}.${format ?? `png`}`, params);
