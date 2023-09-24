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
  executeGitHubCompatibleWebhookSchema
} from "../executeGitHubCompatibleWebhook";

describe(`executeGitHubCompatibleWebhook`, () => {
  mockRequest.post(`/webhooks/:webhook/:token/github`);
  const config = generateMock(executeGitHubCompatibleWebhookSchema);

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
