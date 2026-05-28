import { toValidated } from "@discordkit/core";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { webhookSchema } from "../types/Webhook.js";
import {
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema
} from "../modifyWebhookWithToken.js";

describe(`modifyWebhookWithToken`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook/:token`,
    modifyWebhookWithTokenSchema,
    v.omit(webhookSchema, [`user`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyWebhookWithToken,
        modifyWebhookWithTokenSchema,
        v.omit(webhookSchema, [`user`])
      )(config, { anonymous: true })
    ).resolves.toEqual(expected);
  });
});
