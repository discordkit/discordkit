import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getStickerProcedure,
  getStickerQuery,
  getStickerSafe,
  getStickerSchema
} from "../getSticker";
import { stickerSchema } from "../types/Sticker";

describe(`getSticker`, () => {
  const expected = mockRequest.get(`/stickers/:sticker`, stickerSchema);
  const config = generateMock(getStickerSchema);

  it(`can be used standalone`, async () => {
    await expect(getStickerSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getStickerProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getStickerQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
