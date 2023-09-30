import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteGuildEmoji,
  deleteGuildEmojiProcedure,
  deleteGuildEmojiSafe,
  deleteGuildEmojiSchema
} from "../deleteGuildEmoji";
import { emojiSchema } from "../types/Emoji";

describe(`deleteGuildEmoji`, () => {
  mockRequest.delete(`/guilds/:guild/emojis/:emoji`, emojiSchema);
  const config = generateMock(deleteGuildEmojiSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteGuildEmojiSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteGuildEmojiProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
