import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getWebhookProcedure,
  getWebhookQuery,
  getWebhookSafe,
  getWebhookSchema
} from "../getWebhook.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getWebhook`, () => {
  const expected = mockRequest.get(`/webhooks/:webhook`, webhookSchema);
  const config = mockSchema(getWebhookSchema);

  it(`can be used standalone`, async () => {
    await expect(getWebhookSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getWebhookProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getWebhookQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
