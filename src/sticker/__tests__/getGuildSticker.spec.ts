import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stickerSchema } from "../types";
import {
  getGuildStickerQuery,
  getGuildStickerSchema
} from "../getGuildSticker";

describe(`getGuildSticker`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/stickers/:sticker`,
    stickerSchema
  );
  const config = generateMock(getGuildStickerSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildSticker(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildStickerQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
