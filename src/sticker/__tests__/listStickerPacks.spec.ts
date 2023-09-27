import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listStickerPacksProcedure,
  listStickerPacksQuery,
  stickerPacksSchema
} from "../listStickerPacks";

describe(`listStickerPacks`, () => {
  const expected = mockRequest.get(`/sticker-packs`, stickerPacksSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listStickerPacksProcedure)()
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listStickerPacksQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
