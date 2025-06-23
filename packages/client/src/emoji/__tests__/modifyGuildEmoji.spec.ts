import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  modifyGuildEmoji,
  modifyGuildEmojiProcedure,
  modifyGuildEmojiSafe,
  modifyGuildEmojiSchema
} from "../modifyGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`modifyGuildEmoji`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/emojis/:emoji`,
    emojiSchema
  );
  const config = mockSchema(modifyGuildEmojiSchema);

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
