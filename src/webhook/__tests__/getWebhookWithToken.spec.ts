import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getWebhookWithTokenProcedure,
  getWebhookWithTokenQuery,
  getWebhookWithTokenSchema
} from "../getWebhookWithToken";
import { webhookSchema } from "../types/Webhook";

describe(`getWebhookWithToken`, () => {
  const expected = mockRequest.get(
    `/webhooks/:webhook/:token`,
    webhookSchema.omit({ user: true })
  );
  const config = generateMock(getWebhookWithTokenSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getWebhookWithTokenProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getWebhookWithTokenQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
