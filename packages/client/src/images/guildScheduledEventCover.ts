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

export const guildScheduledEventCoverSchema = object({
  event: snowflake,
  cover: pipe(string(), nonEmpty()),
  format: exactOptional(picklist([`png`, `jpg`, `webp`])),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const guildScheduledEventCover = ({
  event,
  cover,
  format,
  params
}: InferOutput<typeof guildScheduledEventCoverSchema>): string =>
  getAsset(`/guild-events/${event}/${cover}.${format ?? `png`}`, params);
