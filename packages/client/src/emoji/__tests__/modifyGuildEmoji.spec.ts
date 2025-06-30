import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyGuildEmoji,
  modifyGuildEmojiProcedure,
  modifyGuildEmojiSafe,
  modifyGuildEmojiSchema
} from "../modifyGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`modifyGuildEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/emojis/:emoji`,
    modifyGuildEmojiSchema,
    emojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyGuildEmojiSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildEmojiProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
