import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { getWebhookSchema, getWebhook } from "../getWebhook.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getWebhook`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:webhook`,
    getWebhookSchema,
    webhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(getWebhook, getWebhookSchema, webhookSchema)(config)
    ).resolves.toEqual(expected);
  });
});
