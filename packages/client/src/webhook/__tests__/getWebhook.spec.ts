import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getWebhookProcedure,
  getWebhookQuery,
  getWebhookSafe,
  getWebhookSchema
} from "../getWebhook.ts";
import { webhookSchema } from "../types/Webhook.ts";

describe(`getWebhook`, () => {
  const expected = mockRequest.get(`/webhooks/:webhook`, webhookSchema);
  const config = generateMock(getWebhookSchema);

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
