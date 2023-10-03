import { getAsset } from "@discordkit/core";
import { z } from "zod";

export const defaultUserAvatarSchema = z.object({
  index: z.string().min(1)
});

export const defaultUserAvatar = ({
  index
}: z.infer<typeof defaultUserAvatarSchema>): string =>
  getAsset(`/embed/avatars/${index}.png`);
