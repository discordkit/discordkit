import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildSticker,
  createGuildStickerProcedure,
  createGuildStickerSafe,
  createGuildStickerSchema
} from "../createGuildSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`createGuildSticker`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/stickers`,
    createGuildStickerSchema,
    stickerSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildStickerSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildStickerProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
