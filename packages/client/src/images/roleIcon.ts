import { getAsset, snowflake } from "@discordkit/core";
import {
  type Output,
  minLength,
  object,
  optional,
  string,
  enumType
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const roleIconSchema = object({
  role: snowflake,
  icon: string([minLength(1)]),
  format: optional(enumType([`png`, `jpg`, `webp`]), `png`),
  params: optional(
    object({
      size: imageSizes
    })
  )
});

export const roleIcon = ({
  role,
  icon,
  format,
  params
}: Output<typeof roleIconSchema>): string =>
  getAsset(`/role-icons/${role}/${icon}.${format ?? `png`}`, params);
