import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { getGuildStickerSchema, getGuildSticker } from "../getGuildSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`getGuildSticker`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/stickers/:sticker`,
    getGuildStickerSchema,
    stickerSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGuildSticker, getGuildStickerSchema, stickerSchema)(config)
    ).resolves.toEqual(expected);
  });
});
