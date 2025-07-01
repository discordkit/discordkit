import * as v from "valibot";
import { getAsset, snowflake } from "@discordkit/core";
import { imageSizes } from "./types/ImageSizes.js";

export const guildScheduledEventCoverSchema = v.object({
  event: snowflake,
  cover: v.pipe(v.string(), v.nonEmpty()),
  format: v.exactOptional(v.picklist([`png`, `jpg`, `webp`])),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const guildScheduledEventCover = ({
  event,
  cover,
  format,
  params
}: v.InferOutput<typeof guildScheduledEventCoverSchema>): string =>
  getAsset(`/guild-events/${event}/${cover}.${format ?? `png`}`, params);
