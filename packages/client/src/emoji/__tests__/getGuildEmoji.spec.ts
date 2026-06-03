import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { getGuildEmojiSchema, getGuildEmoji } from "../getGuildEmoji.js";
import { emojiSchema } from "../types/Emoji.js";

describe(`getGuildEmoji`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/emojis/:emoji`,
    getGuildEmojiSchema,
    emojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getGuildEmoji, getGuildEmojiSchema, emojiSchema)(config)
    ).resolves.toEqual(expected);
  });
});
