import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getGuildEmojiQuery, getGuildEmojiSchema } from "../getGuildEmoji";
import { emojiSchema } from "../types";

describe(`getGuildEmoji`, () => {
  const expected = mockRequest.get(`/guilds/:guild/emojis/:emoji`, emojiSchema);
  const config = generateMock(getGuildEmojiSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildEmoji(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildEmojiQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
