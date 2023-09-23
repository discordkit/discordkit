import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stickerSchema } from "../types";
import { getStickerQuery, getStickerSchema } from "../getSticker";

describe(`getSticker`, () => {
  const expected = mockRequest.get(`/stickers/:sticker`, stickerSchema);
  const config = generateMock(getStickerSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getSticker(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getStickerQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
