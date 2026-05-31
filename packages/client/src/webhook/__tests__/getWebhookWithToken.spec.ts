import { omit, toValidated } from "@discordkit/core";
import { mockUtils } from "#mocks";
import { webhookSchema } from "../types/Webhook.js";
import {
  getWebhookWithTokenSchema,
  getWebhookWithToken
} from "../getWebhookWithToken.js";

describe(`getWebhookWithToken`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:webhook/:token`,
    getWebhookWithTokenSchema,
    omit(webhookSchema, [`user`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getWebhookWithToken,
        getWebhookWithTokenSchema,
        omit(webhookSchema, [`user`])
      )(config, { anonymous: true })
    ).resolves.toEqual(expected);
  });
});
