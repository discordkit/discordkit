import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildSticker,
  modifyGuildStickerProcedure,
  modifyGuildStickerSchema
} from "../modifyGuildSticker";
import { stickerSchema } from "../types/Sticker";

describe(`modifyGuildSticker`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/stickers/:sticker`,
    stickerSchema
  );
  const config = generateMock(modifyGuildStickerSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildStickerProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
