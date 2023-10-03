import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const guildScheduledEventCoverSchema = z.object({
  event: snowflake,
  cover: z.string().min(1),
  format: z
    .union([z.literal(`png`), z.literal(`jpg`), z.literal(`webp`)])
    .optional()
    .default(`png`),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const guildScheduledEventCover = ({
  event,
  cover,
  format,
  params
}: z.infer<typeof guildScheduledEventCoverSchema>): string =>
  getAsset(`/guild-events/${event}/${cover}.${format}`, params);
