import * as v from "valibot";
import { getAsset } from "@discordkit/core/requests/getAsset";
import { boundedString } from "@discordkit/core/validations/boundedString";

export const defaultUserAvatarSchema = v.object({
  index: boundedString()
});

export const defaultUserAvatar = ({
  index
}: v.InferOutput<typeof defaultUserAvatarSchema>): string =>
  getAsset(`/embed/avatars/${index}.png`);
