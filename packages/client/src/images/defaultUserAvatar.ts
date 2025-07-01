import * as v from "valibot";
import { getAsset } from "@discordkit/core";

export const defaultUserAvatarSchema = v.object({
  index: v.pipe(v.string(), v.nonEmpty())
});

export const defaultUserAvatar = ({
  index
}: v.InferOutput<typeof defaultUserAvatarSchema>): string =>
  getAsset(`/embed/avatars/${index}.png`);
