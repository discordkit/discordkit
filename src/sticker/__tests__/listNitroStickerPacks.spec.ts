import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listNitroStickerPacksProcedure,
  listNitroStickerPacksQuery,
  nitroStickerPacksSchema
} from "../listNitroStickerPacks";

describe(`listNitroStickerPacks`, () => {
  const expected = mockRequest.get(`/sticker-packs`, nitroStickerPacksSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listNitroStickerPacksProcedure)()
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listNitroStickerPacksQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
