import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  listGuildStickersProcedure,
  listGuildStickersQuery,
  listGuildStickersSafe,
  listGuildStickersSchema
} from "../listGuildStickers.ts";
import { stickerSchema } from "../types/Sticker.ts";

describe(`listGuildStickers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/stickers`,
    stickerSchema.array().length(1)
  );
  const config = mockSchema(listGuildStickersSchema);

  it(`can be used standalone`, async () => {
    await expect(listGuildStickersSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listGuildStickersProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listGuildStickersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
