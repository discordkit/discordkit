import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createApplicationEmoji,
  createApplicationEmojiProcedure,
  createApplicationEmojiSafe,
  createApplicationEmojiSchema
} from "../createApplicationEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`createApplicationEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/applications/:application/emojis`,
    createApplicationEmojiSchema,
    emojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createApplicationEmojiSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createApplicationEmojiProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createApplicationEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
