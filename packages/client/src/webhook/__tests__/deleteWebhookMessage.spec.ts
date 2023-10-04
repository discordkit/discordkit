import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteWebhookMessage,
  deleteWebhookMessageProcedure,
  deleteWebhookMessageSafe,
  deleteWebhookMessageSchema
} from "../deleteWebhookMessage.js";

describe(`deleteWebhookMessage`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token/messages/:message`);
  const config = mockSchema(deleteWebhookMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteWebhookMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteWebhookMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteWebhookMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
