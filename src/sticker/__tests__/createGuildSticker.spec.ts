import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGuildSticker,
  createGuildStickerProcedure,
  createGuildStickerSchema
} from "../createGuildSticker";
import { stickerSchema } from "../types/Sticker";

describe(`createGuildSticker`, () => {
  const expected = mockRequest.post(`/guilds/:guild/stickers`, stickerSchema);
  const config = generateMock(createGuildStickerSchema);

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
