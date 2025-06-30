import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { omit } from "valibot";
import {
  getWebhookWithTokenProcedure,
  getWebhookWithTokenQuery,
  getWebhookWithTokenSafe,
  getWebhookWithTokenSchema
} from "../getWebhookWithToken.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getWebhookWithToken`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:webhook/:token`,
    getWebhookWithTokenSchema,
    omit(webhookSchema, [`user`])
  );

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
