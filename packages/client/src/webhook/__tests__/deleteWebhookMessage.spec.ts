import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  deleteWebhookMessage,
  deleteWebhookMessageSchema
} from "../deleteWebhookMessage.js";

describe(`deleteWebhookMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/webhooks/:webhook/:token/messages/:message`,
    deleteWebhookMessageSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteWebhookMessage, deleteWebhookMessageSchema)(config, {
        anonymous: true
      })
    ).resolves.not.toThrow();
  });
});
