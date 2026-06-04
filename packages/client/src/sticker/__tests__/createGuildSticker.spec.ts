import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createGuildSticker,
  createGuildStickerSchema
} from "../createGuildSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`createGuildSticker`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/stickers`,
    createGuildStickerSchema,
    stickerSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGuildSticker,
        createGuildStickerSchema,
        stickerSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
