import { getAsset, snowflake } from "@discordkit/core";
import {
  type InferOutput,
  nonEmpty,
  object,
  exactOptional,
  pipe,
  string
} from "valibot";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarDecorationSchema = object({
  user: snowflake,
  decoration: pipe(string(), nonEmpty()),
  params: exactOptional(
    object({
      size: imageSizes
    })
  )
});

export const userAvatarDecoration = ({
  user,
  decoration,
  params
}: InferOutput<typeof userAvatarDecorationSchema>): string =>
  getAsset(`/avatar-decorations/${user}/${decoration}.png`, params);
