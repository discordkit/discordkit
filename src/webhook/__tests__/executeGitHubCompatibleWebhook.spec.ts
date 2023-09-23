import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  executeGitHubCompatibleWebhook,
  executeGitHubCompatibleWebhookSchema
} from "../executeGitHubCompatibleWebhook";

describe(`executeGitHubCompatibleWebhook`, () => {
  mockRequest.post(`/webhooks/:webhook/:token/github`);
  const config = generateMock(executeGitHubCompatibleWebhookSchema);

  it(`is tRPC compatible`, () => {
    expect(async () =>
      client.executeGitHubCompatibleWebhook(config)
    ).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(executeGitHubCompatibleWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
