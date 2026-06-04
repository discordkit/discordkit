import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  executeGitHubCompatibleWebhook,
  executeGitHubCompatibleWebhookSchema
} from "../executeGitHubCompatibleWebhook.js";

describe(`executeGitHubCompatibleWebhook`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:webhook/:token/github`,
    executeGitHubCompatibleWebhookSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        executeGitHubCompatibleWebhook,
        executeGitHubCompatibleWebhookSchema
      )(config, { anonymous: true })
    ).resolves.not.toThrow();
  });
});
