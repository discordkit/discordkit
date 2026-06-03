import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { stickerPacksSchema, listStickerPacks } from "../listStickerPacks.js";

describe(`listStickerPacks`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/sticker-packs`,
    null,
    stickerPacksSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(listStickerPacks, null, stickerPacksSchema)()
    ).resolves.toEqual(expected);
  });
});
