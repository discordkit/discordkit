import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGuildEmoji,
  createGuildEmojiProcedure,
  createGuildEmojiSchema
} from "../createGuildEmoji";
import { emojiSchema } from "../types/Emoji";

describe(`createGuildEmoji`, () => {
  const expected = mockRequest.post(`/guilds/:guild/emojis`, emojiSchema);
  const config = generateMock(createGuildEmojiSchema);

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
