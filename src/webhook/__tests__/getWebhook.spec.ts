import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getWebhookProcedure,
  getWebhookQuery,
  getWebhookSchema
} from "../getWebhook";
import { webhookSchema } from "../types/Webhook";

describe(`getWebhook`, () => {
  const expected = mockRequest.get(`/webhooks/:webhook`, webhookSchema);
  const config = generateMock(getWebhookSchema);

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
