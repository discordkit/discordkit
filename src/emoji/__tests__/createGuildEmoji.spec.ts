import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { createGuildEmoji, createGuildEmojiSchema } from "../createGuildEmoji";
import { emojiSchema } from "../types";

describe(`createGuildEmoji`, () => {
  const expected = mockRequest.post(`/guilds/:guild/emojis`, emojiSchema);
  const config = generateMock(createGuildEmojiSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildEmoji(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
