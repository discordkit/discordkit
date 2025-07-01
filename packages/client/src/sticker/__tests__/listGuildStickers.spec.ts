import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { stickerSchema } from "../types/Sticker.js";
import {
  listGuildStickersProcedure,
  listGuildStickersQuery,
  listGuildStickersSafe,
  listGuildStickersSchema
} from "../listGuildStickers.js";

describe(`listGuildStickers`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/stickers`,
    listGuildStickersSchema,
    v.pipe(v.array(stickerSchema), v.length(1))
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
