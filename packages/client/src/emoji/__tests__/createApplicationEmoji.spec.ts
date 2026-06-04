import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createApplicationEmoji,
  createApplicationEmojiSchema
} from "../createApplicationEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`createApplicationEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/applications/:application/emojis`,
    createApplicationEmojiSchema,
    emojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createApplicationEmoji,
        createApplicationEmojiSchema,
        emojiSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
