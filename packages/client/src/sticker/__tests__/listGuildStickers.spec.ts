import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  listGuildStickersProcedure,
  listGuildStickersQuery,
  listGuildStickersSafe,
  listGuildStickersSchema
} from "../listGuildStickers.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`listGuildStickers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/stickers`,
    array(stickerSchema, [length(1)])
  );
  const config = mockSchema(listGuildStickersSchema);

  it(`can be used standalone`, async () => {
    await expect(listGuildStickersSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listGuildStickersProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listGuildStickersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
