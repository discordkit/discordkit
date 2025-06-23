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

export const roleIconSchema = object({
  role: snowflake,
  icon: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
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
}: InferOutput<typeof roleIconSchema>): string =>
  getAsset(`/role-icons/${role}/${icon}.${format ?? `png`}`, params);
