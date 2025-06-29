import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildSticker,
  modifyGuildStickerProcedure,
  modifyGuildStickerSafe,
  modifyGuildStickerSchema
} from "../modifyGuildSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`modifyGuildSticker`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/stickers/:sticker`,
    modifyGuildStickerSchema,
    stickerSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildStickerSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildStickerProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
