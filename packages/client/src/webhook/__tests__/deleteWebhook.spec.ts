import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { deleteWebhook, deleteWebhookSchema } from "../deleteWebhook.js";

describe(`deleteWebhook`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/webhooks/:webhook`,
    deleteWebhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteWebhook, deleteWebhookSchema)(config)
    ).resolves.not.toThrow();
  });
});
