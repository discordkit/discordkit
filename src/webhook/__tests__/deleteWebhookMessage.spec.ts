import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteWebhookMessage,
  deleteWebhookMessageProcedure,
  deleteWebhookMessageSchema
} from "../deleteWebhookMessage";

describe(`deleteWebhookMessage`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token/messages/:message`);
  const config = generateMock(deleteWebhookMessageSchema);

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
