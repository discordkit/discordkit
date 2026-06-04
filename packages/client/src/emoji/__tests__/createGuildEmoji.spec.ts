import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  createGuildEmoji,
  createGuildEmojiSchema
} from "../createGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`createGuildEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/emojis`,
    createGuildEmojiSchema,
    emojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createGuildEmoji, createGuildEmojiSchema, emojiSchema)(config)
    ).resolves.toEqual(expected);
  });
});
