import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteOriginalInteractionResponse,
  deleteOriginalInteractionResponseSchema
} from "../deleteOriginalInteractionResponse.js";

describe(`deleteOriginalInteractionResponse`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/webhooks/:webhook/:token/messages/:message`,
    deleteOriginalInteractionResponseSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        deleteOriginalInteractionResponse,
        deleteOriginalInteractionResponseSchema
      )(config, {
        anonymous: true
      })
    ).resolves.not.toThrow();
  });
});
