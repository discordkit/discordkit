import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { getStickerSchema, getSticker } from "../getSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`getSticker`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/stickers/:sticker`,
    getStickerSchema,
    stickerSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getSticker, getStickerSchema, stickerSchema)(config)
    ).resolves.toEqual(expected);
  });
});
