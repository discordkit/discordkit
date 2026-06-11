import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { modifyWebhook, modifyWebhookSchema } from "../modifyWebhook.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`modifyWebhook`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook`,
    modifyWebhookSchema,
    webhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(modifyWebhook, modifyWebhookSchema, webhookSchema)(config)
    ).resolves.toEqual(expected);
  });
});
