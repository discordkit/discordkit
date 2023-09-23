import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { stickerSchema } from "../types";
import {
  listGuildStickersQuery,
  listGuildStickersSchema
} from "../listGuildStickers";

describe(`listGuildStickers`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/stickers`,
    stickerSchema.array()
  );
  const config = generateMock(listGuildStickersSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listGuildStickers(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listGuildStickersQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
