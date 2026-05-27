import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  modifyGuildEmoji,
  modifyGuildEmojiSchema
} from "../modifyGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`modifyGuildEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/guilds/:guild/emojis/:emoji`,
    modifyGuildEmojiSchema,
    emojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(modifyGuildEmoji, modifyGuildEmojiSchema, emojiSchema)(config)
    ).resolves.toEqual(expected);
  });
});
