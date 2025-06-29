import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteWebhookMessage,
  deleteWebhookMessageProcedure,
  deleteWebhookMessageSafe,
  deleteWebhookMessageSchema
} from "../deleteWebhookMessage.js";

describe(`deleteWebhookMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/webhooks/:webhook/:token/messages/:message`,
    deleteWebhookMessageSchema
  );

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
