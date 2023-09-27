import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getWebhookMessageProcedure,
  getWebhookMessageQuery,
  getWebhookMessageSchema
} from "../getWebhookMessage";
import { messageSchema } from "../../channel/types/Message";

describe(`getWebhookMessage`, () => {
  mockRequest.get(`/webhooks/:webhook/:token/messages/:message`, messageSchema);
  const config = generateMock(getWebhookMessageSchema);

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
