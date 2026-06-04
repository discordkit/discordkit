import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteAllReactions,
  deleteAllReactionsSchema
} from "../deleteAllReactions.js";

describe(`deleteAllReactions`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message/reactions`,
    deleteAllReactionsSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteAllReactions, deleteAllReactionsSchema)(config)
    ).resolves.not.toThrow();
  });
});
