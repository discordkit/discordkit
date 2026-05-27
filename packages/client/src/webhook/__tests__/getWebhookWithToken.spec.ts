import { toValidated } from "@discordkit/core";
import * as v from "valibot";
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
    v.omit(webhookSchema, [`user`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getWebhookWithToken,
        getWebhookWithTokenSchema,
        v.omit(webhookSchema, [`user`])
      )(config)
    ).resolves.toEqual(expected);
  });
});
