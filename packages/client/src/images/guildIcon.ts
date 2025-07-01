import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildIconSchema = v.object({
  guild: snowflake,
  icon: v.pipe(v.string(), v.nonEmpty()),
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
