import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { deleteGuildEmoji, deleteGuildEmojiSchema } from "../deleteGuildEmoji";
import { emojiSchema } from "../types";

describe(`deleteGuildEmoji`, () => {
  mockRequest.delete(`/guilds/:guild/emojis/:emoji`, emojiSchema);
  const config = generateMock(deleteGuildEmojiSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteGuildEmoji(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteGuildEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
