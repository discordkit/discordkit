import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getWebhookMessageProcedure,
  getWebhookMessageQuery,
  getWebhookMessageSafe,
  getWebhookMessageSchema
} from "../getWebhookMessage.js";
import { messageSchema } from "../../channel/types/Message.js";

describe(`getWebhookMessage`, () => {
  mockRequest.get(`/webhooks/:webhook/:token/messages/:message`, messageSchema);
  const config = mockSchema(getWebhookMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(getWebhookMessageSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getWebhookMessageProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getWebhookMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
