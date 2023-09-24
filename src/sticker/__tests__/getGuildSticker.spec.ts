import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildStickerProcedure,
  getGuildStickerQuery,
  getGuildStickerSchema
} from "../getGuildSticker";
import { stickerSchema } from "../types/Sticker";

describe(`getGuildSticker`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/stickers/:sticker`,
    stickerSchema
  );
  const config = generateMock(getGuildStickerSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildStickerProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildStickerQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
