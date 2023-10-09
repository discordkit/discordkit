import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  listGuildEmojisProcedure,
  listGuildEmojisQuery,
  listGuildEmojisSafe,
  listGuildEmojisSchema
} from "../listGuildEmojis.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`listGuildEmojis`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/emojis`,
    array(emojiSchema, [length(1)])
  );
  const config = mockSchema(listGuildEmojisSchema);

  it(`can be used standalone`, async () => {
    await expect(listGuildEmojisSafe(config)).resolves.toStrictEqual(expected);
  });

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
