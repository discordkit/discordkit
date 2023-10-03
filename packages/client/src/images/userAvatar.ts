import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.ts";

export const userAvatarSchema = z.object({
  user: snowflake,
  avatar: z.string().min(1),
  format: z
    .union([
      z.literal(`png`),
      z.literal(`jpg`),
      z.literal(`webp`),
      z.literal(`gif`)
    ])
    .optional()
    .default(`png`),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const userAvatar = ({
  user,
  avatar,
  format,
  params
}: z.infer<typeof userAvatarSchema>): string =>
  getAsset(`/avatars/${user}/${avatar}.${format}`, params);
