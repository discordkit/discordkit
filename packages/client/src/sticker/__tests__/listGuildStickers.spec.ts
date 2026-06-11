import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { stickerSchema } from "../types/Sticker.js";
import {
  listGuildStickersSchema,
  listGuildStickers
} from "../listGuildStickers.js";

describe(`listGuildStickers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/stickers`,
    listGuildStickersSchema,
    v.pipe(v.array(stickerSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listGuildStickers,
        listGuildStickersSchema,
        v.pipe(v.array(stickerSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
