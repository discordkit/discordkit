import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createGuildEmoji,
  createGuildEmojiProcedure,
  createGuildEmojiSafe,
  createGuildEmojiSchema
} from "../createGuildEmoji.ts";
import { emojiSchema } from "../types/Emoji.ts";

describe(`createGuildEmoji`, () => {
  const expected = mockRequest.post(`/guilds/:guild/emojis`, emojiSchema);
  const config = mockSchema(createGuildEmojiSchema);

  it(`can be used standalone`, async () => {
    await expect(createGuildEmojiSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildEmojiProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
