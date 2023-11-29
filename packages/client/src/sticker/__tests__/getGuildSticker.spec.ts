import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildStickerProcedure,
  getGuildStickerQuery,
  getGuildStickerSafe,
  getGuildStickerSchema
} from "../getGuildSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`getGuildSticker`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/stickers/:sticker`,
    stickerSchema
  );
  const config = mockSchema(getGuildStickerSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildStickerSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildStickerProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildStickerQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
