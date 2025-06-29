import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  listGuildEmojisProcedure,
  listGuildEmojisQuery,
  listGuildEmojisSafe,
  listGuildEmojisSchema
} from "../listGuildEmojis.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`listGuildEmojis`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/emojis`,
    listGuildEmojisSchema,
    pipe(array(emojiSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(listGuildEmojisSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listGuildEmojisProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listGuildEmojisQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
