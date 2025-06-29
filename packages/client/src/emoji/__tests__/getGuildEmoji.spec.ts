import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildEmojiProcedure,
  getGuildEmojiQuery,
  getGuildEmojiSafe,
  getGuildEmojiSchema
} from "../getGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`getGuildEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/emojis/:emoji`,
    getGuildEmojiSchema,
    emojiSchema
  );

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
