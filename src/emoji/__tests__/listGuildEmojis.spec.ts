import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  listGuildEmojisQuery,
  listGuildEmojisSchema
} from "../listGuildEmojis";
import { emojiSchema } from "../types";

describe(`listGuildEmojis`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/emojis`,
    emojiSchema.array()
  );
  const config = generateMock(listGuildEmojisSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.listGuildEmojis(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(listGuildEmojisQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
