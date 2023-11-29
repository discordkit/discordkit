import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getStickerProcedure,
  getStickerQuery,
  getStickerSafe,
  getStickerSchema
} from "../getSticker.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`getSticker`, () => {
  const expected = mockRequest.get(`/stickers/:sticker`, stickerSchema);
  const config = mockSchema(getStickerSchema);

  it(`can be used standalone`, async () => {
    await expect(getStickerSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getStickerProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getStickerQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
