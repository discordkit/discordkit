import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  executeGitHubCompatibleWebhook,
  executeGitHubCompatibleWebhookProcedure,
  executeGitHubCompatibleWebhookSafe,
  executeGitHubCompatibleWebhookSchema
} from "../executeGitHubCompatibleWebhook";

describe(`executeGitHubCompatibleWebhook`, () => {
  mockRequest.post(`/webhooks/:webhook/:token/github`);
  const config = generateMock(executeGitHubCompatibleWebhookSchema);

  it(`can be used standalone`, async () => {
    await expect(
      executeGitHubCompatibleWebhookSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(executeGitHubCompatibleWebhookProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(executeGitHubCompatibleWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
