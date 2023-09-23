import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteGuildSticker,
  deleteGuildStickerSchema
} from "../deleteGuildSticker";

describe(`deleteGuildSticker`, () => {
  mockRequest.delete(`/guilds/:guild/stickers/:sticker`);
  const config = generateMock(deleteGuildStickerSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteGuildSticker(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
