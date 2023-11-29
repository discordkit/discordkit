import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { omit } from "valibot";
import {
  getWebhookWithTokenProcedure,
  getWebhookWithTokenQuery,
  getWebhookWithTokenSafe,
  getWebhookWithTokenSchema
} from "../getWebhookWithToken.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getWebhookWithToken`, () => {
  const expected = mockRequest.get(
    `/webhooks/:webhook/:token`,
    omit(webhookSchema, [`user`])
  );
  const config = mockSchema(getWebhookWithTokenSchema);

  it(`can be used standalone`, async () => {
    await expect(getWebhookWithTokenSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getWebhookWithTokenProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getWebhookWithTokenQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
