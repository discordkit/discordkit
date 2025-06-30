import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getStickerPackProcedure,
  getStickerPackQuery,
  getStickerPackSafe,
  getStickerPackSchema
} from "../getStickerPack.js";
import { stickerPackSchema } from "../types/StickerPack.js";

describe(`getStickerPack`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/sticker-packs/:pack`,
    getStickerPackSchema,
    stickerPackSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getStickerPackSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getStickerPackProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getStickerPackQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
