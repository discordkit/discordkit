import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getApplicationEmojiProcedure,
  getApplicationEmojiQuery,
  getApplicationEmojiSafe,
  getApplicationEmojiSchema
} from "../getApplicationEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`getApplicationEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/emojis/:emoji`,
    getApplicationEmojiSchema,
    emojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getApplicationEmojiSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getApplicationEmojiProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getApplicationEmojiQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
