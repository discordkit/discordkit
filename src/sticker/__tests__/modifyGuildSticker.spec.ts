import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stickerSchema } from "../types";
import {
  modifyGuildSticker,
  modifyGuildStickerSchema
} from "../modifyGuildSticker";

describe(`modifyGuildSticker`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/stickers/:sticker`,
    stickerSchema
  );
  const config = generateMock(modifyGuildStickerSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildSticker(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
