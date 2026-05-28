import { toValidated } from "@discordkit/core";

import { mockUtils } from "#mocks";
import {
  deleteWebhookWithToken,
  deleteWebhookWithTokenSchema
} from "../deleteWebhookWithToken.js";

describe(`deleteWebhookWithToken`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/webhooks/:webhook/:token`,
    deleteWebhookWithTokenSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(deleteWebhookWithToken, deleteWebhookWithTokenSchema)(
        config,
        { anonymous: true }
      )
    ).resolves.not.toThrow();
  });
});
