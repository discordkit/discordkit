import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createGuildEmoji,
  createGuildEmojiProcedure,
  createGuildEmojiSafe,
  createGuildEmojiSchema
} from "../createGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`createGuildEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/emojis`,
    createGuildEmojiSchema,
    emojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createGuildEmojiSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildEmojiProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
