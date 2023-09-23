import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { modifyGuildEmoji, modifyGuildEmojiSchema } from "../modifyGuildEmoji";
import { emojiSchema } from "../types";

describe(`modifyGuildEmoji`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/emojis/:emoji`,
    emojiSchema
  );
  const config = generateMock(modifyGuildEmojiSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyGuildEmoji(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
