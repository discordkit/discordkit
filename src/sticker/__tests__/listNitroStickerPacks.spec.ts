import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  listNitroStickerPacksQuery,
  nitroStickerPacksSchema
} from "../listNitroStickerPacks";

describe(`listNitroStickerPacks`, () => {
  const expected = mockRequest.get(`/sticker-packs`, nitroStickerPacksSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listNitroStickerPacks();
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listNitroStickerPacksQuery);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
