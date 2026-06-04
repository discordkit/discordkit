import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  modifyApplicationEmoji,
  modifyApplicationEmojiSchema
} from "../modifyApplicationEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`modifyApplicationEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/applications/:application/emojis/:emoji`,
    modifyApplicationEmojiSchema,
    emojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyApplicationEmoji,
        modifyApplicationEmojiSchema,
        emojiSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
