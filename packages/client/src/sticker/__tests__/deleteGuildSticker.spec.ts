import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteGuildSticker,
  deleteGuildStickerSchema
} from "../deleteGuildSticker.js";

describe(`deleteGuildSticker`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/stickers/:sticker`,
    deleteGuildStickerSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteGuildSticker, deleteGuildStickerSchema)(config)
    ).resolves.not.toThrow();
  });
});
