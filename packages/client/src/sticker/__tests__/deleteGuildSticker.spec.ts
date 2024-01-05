import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  deleteGuildSticker,
  deleteGuildStickerProcedure,
  deleteGuildStickerSafe,
  deleteGuildStickerSchema
} from "../deleteGuildSticker.js";

describe(`deleteGuildSticker`, () => {
  mockRequest.delete(`/guilds/:guild/stickers/:sticker`);
  const config = mockSchema(deleteGuildStickerSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteGuildStickerSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildStickerProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
