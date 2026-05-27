import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  deleteApplicationEmoji,
  deleteApplicationEmojiSchema
} from "../deleteApplicationEmoji.js";

describe(`deleteApplicationEmoji`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/applications/:application/emojis/:emoji`,
    deleteApplicationEmojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteApplicationEmoji, deleteApplicationEmojiSchema)(config)
    ).resolves.not.toThrow();
  });
});
