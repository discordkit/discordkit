import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGuildSticker,
  deleteGuildStickerProcedure,
  deleteGuildStickerSchema
} from "../deleteGuildSticker";

describe(`deleteGuildSticker`, () => {
  mockRequest.delete(`/guilds/:guild/stickers/:sticker`);
  const config = generateMock(deleteGuildStickerSchema);

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
