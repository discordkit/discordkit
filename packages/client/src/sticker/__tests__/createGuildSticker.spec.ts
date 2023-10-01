import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildSticker,
  createGuildStickerProcedure,
  createGuildStickerSafe,
  createGuildStickerSchema
} from "../createGuildSticker.ts";
import { stickerSchema } from "../types/Sticker.ts";

describe(`createGuildSticker`, () => {
  const expected = mockRequest.post(`/guilds/:guild/stickers`, stickerSchema);
  const config = mockSchema(createGuildStickerSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildStickerSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildStickerProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
