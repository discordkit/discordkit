import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  executeSlackCompatibleWebhook,
  executeSlackCompatibleWebhookSchema
} from "../executeSlackCompatibleWebhook";

describe(`executeSlackCompatibleWebhook`, () => {
  mockRequest.post(`/webhooks/:webhook/:token/slack`);
  const config = generateMock(executeSlackCompatibleWebhookSchema);

  it(`is tRPC compatible`, () => {
    expect(async () =>
      client.executeSlackCompatibleWebhook(config)
    ).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(executeSlackCompatibleWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
