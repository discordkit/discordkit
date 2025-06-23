import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  object,
  string,
  exactOptional,
  picklist,
  pipe,
  nonEmpty
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const guildIconSchema = object({
  guild: snowflake,
  icon: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`, `gif`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const guildIcon = ({
  guild,
  icon,
  format,
  params
}: InferOutput<typeof guildIconSchema>): string =>
  getAsset(`/icons/${guild}/${icon}.${format ?? `png`}`, params);
