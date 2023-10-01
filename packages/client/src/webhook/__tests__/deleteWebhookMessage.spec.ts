import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteWebhookMessage,
  deleteWebhookMessageProcedure,
  deleteWebhookMessageSafe,
  deleteWebhookMessageSchema
} from "../deleteWebhookMessage.ts";

describe(`deleteWebhookMessage`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token/messages/:message`);
  const config = generateMock(deleteWebhookMessageSchema);

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
