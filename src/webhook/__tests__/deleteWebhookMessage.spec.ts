import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteWebhookMessage,
  deleteWebhookMessageSchema
} from "../deleteWebhookMessage";

describe(`deleteWebhookMessage`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token/messages/:message`);
  const config = generateMock(deleteWebhookMessageSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteWebhookMessage(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteWebhookMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
