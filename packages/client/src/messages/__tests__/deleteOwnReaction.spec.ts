import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteOwnReaction,
  deleteOwnReactionSchema
} from "../deleteOwnReaction.js";

describe(`deleteOwnReaction`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message/reactions/:emoji/@me`,
    deleteOwnReactionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteOwnReaction, deleteOwnReactionSchema)(config)
    ).resolves.not.toThrow();
  });
});
