import { toValidated } from "@discordkit/core/requests/toValidated";
import { omitFields } from "@discordkit/core/validations/schema";
import { mockUtils } from "#mocks";
import { incomingWebhookSchema } from "../types/Webhook.js";
import {
  getWebhookWithTokenSchema,
  getWebhookWithToken
} from "../getWebhookWithToken.js";

describe(`getWebhookWithToken`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:webhook/:token`,
    getWebhookWithTokenSchema,
    omitFields(incomingWebhookSchema, [`user`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getWebhookWithToken,
        getWebhookWithTokenSchema,
        omitFields(incomingWebhookSchema, [`user`])
      )(config, { anonymous: true })
    ).resolves.toEqual(expected);
  });
});
