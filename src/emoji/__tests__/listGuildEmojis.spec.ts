import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  listGuildEmojisProcedure,
  listGuildEmojisQuery,
  listGuildEmojisSchema
} from "../listGuildEmojis";
import { emojiSchema } from "../types/Emoji";

describe(`listGuildEmojis`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/emojis`,
    emojiSchema.array()
  );
  const config = generateMock(listGuildEmojisSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listGuildEmojisProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listGuildEmojisQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
