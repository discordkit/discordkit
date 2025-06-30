import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  listStickerPacksProcedure,
  listStickerPacksQuery,
  listStickerPacksSafe,
  stickerPacksSchema
} from "../listStickerPacks.js";

describe(`listStickerPacks`, { repeats: 5 }, () => {
  const { expected } = mockUtils.request.get(
    `/sticker-packs`,
    null,
    stickerPacksSchema
  );

  it(`can be used standalone`, async () => {
    await expect(listStickerPacksSafe()).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(listStickerPacksProcedure)()).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listStickerPacksQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
