import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  editWebhookMessage,
  editWebhookMessageProcedure,
  editWebhookMessageSafe,
  editWebhookMessageSchema
} from "../editWebhookMessage.js";
import { messageSchema } from "../../channel/types/Message.js";

describe(`editWebhookMessage`, () => {
  mockRequest.patch(
    `/webhooks/:webhook/:token/messages/:message`,
    messageSchema
  );
  const config = mockSchema(editWebhookMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(editWebhookMessageSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editWebhookMessageProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editWebhookMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
