import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getWebhookProcedure,
  getWebhookQuery,
  getWebhookSafe,
  getWebhookSchema
} from "../getWebhook.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getWebhook`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/webhooks/:webhook`,
    getWebhookSchema,
    webhookSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getWebhookSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getWebhookProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getWebhookQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
