import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stickerSchema } from "../types";
import {
  createGuildSticker,
  createGuildStickerSchema
} from "../createGuildSticker";

describe(`createGuildSticker`, () => {
  const expected = mockRequest.post(`/guilds/:guild/stickers`, stickerSchema);
  const config = generateMock(createGuildStickerSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildSticker(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildSticker);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
