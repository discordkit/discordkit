import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { executeWebhook, executeWebhookSchema } from "../executeWebhook.js";

describe(`executeWebhook`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:webhook/:token`,
    executeWebhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(executeWebhook, executeWebhookSchema)(config, {
        anonymous: true
      })
    ).resolves.not.toThrow();
  });
});
