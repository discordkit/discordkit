import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  executeSlackCompatibleWebhook,
  executeSlackCompatibleWebhookSchema
} from "../executeSlackCompatibleWebhook.js";

describe(`executeSlackCompatibleWebhook`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:webhook/:token/slack`,
    executeSlackCompatibleWebhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        executeSlackCompatibleWebhook,
        executeSlackCompatibleWebhookSchema
      )(config)
    ).resolves.not.toThrow();
  });
});
