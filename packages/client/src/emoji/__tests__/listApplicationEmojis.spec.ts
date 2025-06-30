import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { object, array, length, pipe } from "valibot";
import {
  listApplicationEmojisProcedure,
  listApplicationEmojisQuery,
  listApplicationEmojisSafe,
  listApplicationEmojisSchema
} from "../listApplicationEmojis.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`listApplicationEmojis`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/emojis`,
    listApplicationEmojisSchema,
    object({ items: pipe(array(emojiSchema), length(1)) })
  );

  it(`can be used standalone`, async () => {
    await expect(listApplicationEmojisSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(listApplicationEmojisProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(listApplicationEmojisQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
