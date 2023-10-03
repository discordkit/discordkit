import { getAsset, snowflake } from "@discordkit/core";
import { z } from "zod";

export const stickerImageSchema = z.object({
  sticker: snowflake,
  format: z
    .union([z.literal(`png`), z.literal(`json`), z.literal(`gif`)])
    .optional()
    .default(`png`)
});

export const sticker = ({
  sticker: id,
  format
}: z.infer<typeof stickerImageSchema>): string =>
  getAsset(`/stickers/${id}.${format}`);
