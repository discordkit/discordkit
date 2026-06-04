import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteUserReaction,
  deleteUserReactionSchema
} from "../deleteUserReaction.js";

describe(`deleteUserReaction`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message/reactions/:emoji/:user`,
    deleteUserReactionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteUserReaction, deleteUserReactionSchema)(config)
    ).resolves.not.toThrow();
  });
});
