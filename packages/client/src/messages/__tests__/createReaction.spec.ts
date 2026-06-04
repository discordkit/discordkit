import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { createReaction, createReactionSchema } from "../createReaction.js";

describe(`createReaction`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.put(
    `/channels/:channel/messages/:message/reactions/:emoji/@me`,
    createReactionSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createReaction, createReactionSchema)(config)
    ).resolves.not.toThrow();
  });
});
