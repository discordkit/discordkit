import { getAsset } from "@discordkit/core";
import { type InferOutput, nonEmpty, object, pipe, string } from "valibot";

export const defaultUserAvatarSchema = object({
  index: pipe(string(), nonEmpty())
});

export const defaultUserAvatar = ({
  index
}: InferOutput<typeof defaultUserAvatarSchema>): string =>
  getAsset(`/embed/avatars/${index}.png`);
