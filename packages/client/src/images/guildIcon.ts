import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  object,
  minLength,
  string,
  optional,
  picklist
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const guildIconSchema = object({
  guild: snowflake,
  icon: string([minLength(1)]),
  format: optional(picklist([`png`, `jpg`, `webp`, `gif`]), `png`),
  params: optional(
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
}: Output<typeof guildIconSchema>): string =>
  getAsset(`/icons/${guild}/${icon}.${format ?? `png`}`, params);
