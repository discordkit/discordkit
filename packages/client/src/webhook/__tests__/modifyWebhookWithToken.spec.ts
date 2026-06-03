import { toValidated } from "@discordkit/core/requests/toValidated";
import { omitFields } from "@discordkit/core/validations/schema";
import { mockUtils } from "#mocks";
import { incomingWebhookSchema } from "../types/Webhook.js";
import {
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema
} from "../modifyWebhookWithToken.js";

describe(`modifyWebhookWithToken`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook/:token`,
    modifyWebhookWithTokenSchema,
    omitFields(incomingWebhookSchema, [`user`])
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        modifyWebhookWithToken,
        modifyWebhookWithTokenSchema,
        omitFields(incomingWebhookSchema, [`user`])
      )(config, { anonymous: true })
    ).resolves.toEqual(expected);
  });
});
