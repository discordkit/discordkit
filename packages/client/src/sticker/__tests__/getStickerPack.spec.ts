import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { getStickerPackSchema, getStickerPack } from "../getStickerPack.js";
import { stickerPackSchema } from "../types/StickerPack.js";

describe(`getStickerPack`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/sticker-packs/:pack`,
    getStickerPackSchema,
    stickerPackSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getStickerPack,
        getStickerPackSchema,
        stickerPackSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
