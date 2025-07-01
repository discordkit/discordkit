import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { emojiSchema } from "../types/Emoji.js";
import {
  listApplicationEmojisProcedure,
  listApplicationEmojisQuery,
  listApplicationEmojisSafe,
  listApplicationEmojisSchema
} from "../listApplicationEmojis.js";

describe(`listApplicationEmojis`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/emojis`,
    listApplicationEmojisSchema,
    v.object({ items: v.pipe(v.array(emojiSchema), v.length(1)) })
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
