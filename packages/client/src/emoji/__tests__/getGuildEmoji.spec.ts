import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildEmojiProcedure,
  getGuildEmojiQuery,
  getGuildEmojiSafe,
  getGuildEmojiSchema
} from "../getGuildEmoji.ts";
import { emojiSchema } from "../types/Emoji.ts";

describe(`getGuildEmoji`, () => {
  const expected = mockRequest.get(`/guilds/:guild/emojis/:emoji`, emojiSchema);
  const config = mockSchema(getGuildEmojiSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildEmojiSafe(config)).resolves.toStrictEqual(expected);
  });

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
