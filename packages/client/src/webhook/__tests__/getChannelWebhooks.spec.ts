import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getChannelWebhooksProcedure,
  getChannelWebhooksQuery,
  getChannelWebhooksSafe,
  getChannelWebhooksSchema
} from "../getChannelWebhooks.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getChannelWebhooks`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/webhooks`,
    getChannelWebhooksSchema,
    pipe(array(webhookSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getChannelWebhooksSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelWebhooksProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelWebhooksQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
