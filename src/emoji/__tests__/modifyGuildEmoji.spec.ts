import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyGuildEmoji,
  modifyGuildEmojiProcedure,
  modifyGuildEmojiSchema
} from "../modifyGuildEmoji";
import { emojiSchema } from "../types/Emoji";

describe(`modifyGuildEmoji`, () => {
  const expected = mockRequest.patch(
    `/guilds/:guild/emojis/:emoji`,
    emojiSchema
  );
  const config = generateMock(modifyGuildEmojiSchema);

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
