import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteGuildEmoji,
  deleteGuildEmojiSchema
} from "../deleteGuildEmoji.js";

describe(`deleteGuildEmoji`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/guilds/:guild/emojis/:emoji`,
    deleteGuildEmojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteGuildEmoji, deleteGuildEmojiSchema)(config)
    ).resolves.not.toThrow();
  });
});
