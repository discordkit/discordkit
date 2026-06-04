import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  getApplicationEmojiSchema,
  getApplicationEmoji
} from "../getApplicationEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`getApplicationEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/applications/:application/emojis/:emoji`,
    getApplicationEmojiSchema,
    emojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getApplicationEmoji,
        getApplicationEmojiSchema,
        emojiSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
