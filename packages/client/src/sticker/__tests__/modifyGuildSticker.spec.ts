import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyGuildSticker,
  modifyGuildStickerProcedure,
  modifyGuildStickerSafe,
  modifyGuildStickerSchema
} from "../modifyGuildSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`modifyGuildSticker`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/stickers/:sticker`,
    stickerSchema
  );
  const config = mockSchema(modifyGuildStickerSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildStickerSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildStickerProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
