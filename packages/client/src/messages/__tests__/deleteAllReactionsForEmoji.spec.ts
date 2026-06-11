import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteAllReactionsForEmoji,
  deleteAllReactionsForEmojiSchema
} from "../deleteAllReactionsForEmoji.js";

describe(`deleteAllReactionsForEmoji`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    deleteAllReactionsForEmojiSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteAllReactionsForEmoji,
        deleteAllReactionsForEmojiSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
