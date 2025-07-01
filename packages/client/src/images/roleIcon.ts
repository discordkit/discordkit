import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const roleIconSchema = v.object({
  role: snowflake,
  icon: v.pipe(v.string(), v.nonEmpty()),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const roleIcon = ({
  role,
  icon,
  format,
  params
}: v.InferOutput<typeof roleIconSchema>): string =>
  getAsset(`/role-icons/${role}/${icon}.${format ?? `png`}`, params);
