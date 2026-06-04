import * as v from "valibot";
import { getAsset } from "@discordkit/core/requests/getAsset";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { imageSizes } from "./types/ImageSizes.js";

export const userAvatarDecorationSchema = v.object({
  user: snowflake,
  decoration: boundedString(),
  params: v.exactOptional(
    v.object({
      size: imageSizes
    })
  )
});

export const userAvatarDecoration = ({
  user,
  decoration,
  params
}: v.InferOutput<typeof userAvatarDecorationSchema>): string =>
  getAsset(`/avatar-decorations/${user}/${decoration}.png`, params);
