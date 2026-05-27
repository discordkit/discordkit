import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { emojiSchema } from "../types/Emoji.js";
import {
  listApplicationEmojisSchema,
  listApplicationEmojis
} from "../listApplicationEmojis.js";

describe(`listApplicationEmojis`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/emojis`,
    listApplicationEmojisSchema,
    v.object({ items: v.pipe(v.array(emojiSchema), v.length(1)) })
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        listApplicationEmojis,
        listApplicationEmojisSchema,
        v.object({ items: v.pipe(v.array(emojiSchema), v.length(1)) })
      )(config)
    ).resolves.toEqual(expected);
  });
});
