import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  modifyGuildSticker,
  modifyGuildStickerSchema
} from "../modifyGuildSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`modifyGuildSticker`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/stickers/:sticker`,
    modifyGuildStickerSchema,
    stickerSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyGuildSticker,
        modifyGuildStickerSchema,
        stickerSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
