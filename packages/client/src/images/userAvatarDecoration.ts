import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarDecorationSchema = z.object({
  user: snowflake,
  decoration: z.string().min(1),
  params: z
    .object({
      size: imageSizes
    })
    .optional()
});

export const userAvatarDecoration = ({
  user,
  decoration,
  params
}: z.infer<typeof userAvatarDecorationSchema>): string =>
  getAsset(`/avatar-decorations/${user}/${decoration}.png`, params);
