import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import { createWebhook, createWebhookSchema } from "../createWebhook.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`createWebhook`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/webhooks`,
    createWebhookSchema,
    webhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createWebhook, createWebhookSchema, webhookSchema)(config)
    ).resolves.toEqual(expected);
  });
});
