import { getAsset } from "@discordkit/core";
import { type Output, minLength, object, string } from "valibot";

export const defaultUserAvatarSchema = object({
  index: string([minLength(1)])
});

export const defaultUserAvatar = ({
  index
}: Output<typeof defaultUserAvatarSchema>): string =>
  getAsset(`/embed/avatars/${index}.png`);
