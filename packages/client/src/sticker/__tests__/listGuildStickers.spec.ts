import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { pipe, array, length } from "valibot";
import {
  listGuildStickersProcedure,
  listGuildStickersQuery,
  listGuildStickersSafe,
  listGuildStickersSchema
} from "../listGuildStickers.js";
import { stickerSchema } from "../types/Sticker.js";

describe(`listGuildStickers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/stickers`,
    listGuildStickersSchema,
    pipe(array(stickerSchema), length(1))
  );

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
