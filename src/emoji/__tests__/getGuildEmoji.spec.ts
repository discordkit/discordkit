import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildEmojiProcedure,
  getGuildEmojiQuery,
  getGuildEmojiSchema
} from "../getGuildEmoji";
import { emojiSchema } from "../types/Emoji";

describe(`getGuildEmoji`, () => {
  const expected = mockRequest.get(`/guilds/:guild/emojis/:emoji`, emojiSchema);
  const config = generateMock(getGuildEmojiSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildEmojiProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildEmojiQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
