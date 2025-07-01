import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { webhookSchema } from "../types/Webhook.js";
import {
  getChannelWebhooksProcedure,
  getChannelWebhooksQuery,
  getChannelWebhooksSafe,
  getChannelWebhooksSchema
} from "../getChannelWebhooks.js";

describe(`getChannelWebhooks`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/webhooks`,
    getChannelWebhooksSchema,
    v.pipe(v.array(webhookSchema), v.length(1))
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
