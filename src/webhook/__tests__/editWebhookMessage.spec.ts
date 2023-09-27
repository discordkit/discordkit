import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  editWebhookMessage,
  editWebhookMessageProcedure,
  editWebhookMessageSchema
} from "../editWebhookMessage";
import { messageSchema } from "../../channel/types/Message";

describe(`editWebhookMessage`, () => {
  mockRequest.patch(
    `/webhooks/:webhook/:token/messages/:message`,
    messageSchema
  );
  const config = generateMock(editWebhookMessageSchema);

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
