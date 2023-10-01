import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyGuildEmoji,
  modifyGuildEmojiProcedure,
  modifyGuildEmojiSafe,
  modifyGuildEmojiSchema
} from "../modifyGuildEmoji.ts";
import { emojiSchema } from "../types/Emoji.ts";

describe(`modifyGuildEmoji`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/emojis/:emoji`,
    emojiSchema
  );
  const config = generateMock(modifyGuildEmojiSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyGuildEmojiSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyGuildEmojiProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
