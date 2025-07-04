import * as v from "valibot";
import { getAsset, boundedString } from "@discordkit/core";

export const defaultUserAvatarSchema = v.object({
  index: boundedString()
});

export const defaultUserAvatar = ({
  index
}: v.InferOutput<typeof defaultUserAvatarSchema>): string =>
  getAsset(`/embed/avatars/${index}.png`);
