import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import {
  getGuildEmojiProcedure,
  getGuildEmojiQuery,
  getGuildEmojiSafe,
  getGuildEmojiSchema
} from "../getGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`getGuildEmoji`, () => {
  const expected = mockRequest.get(`/guilds/:guild/emojis/:emoji`, emojiSchema);
  const config = mockSchema(getGuildEmojiSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildEmojiSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getGuildEmojiProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildEmojiQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
