import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  getChannelWebhooksProcedure,
  getChannelWebhooksQuery,
  getChannelWebhooksSafe,
  getChannelWebhooksSchema
} from "../getChannelWebhooks.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`getChannelWebhooks`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/webhooks`,
    array(webhookSchema, [length(1)])
  );
  const config = mockSchema(getChannelWebhooksSchema);

  it(`can be used standalone`, async () => {
    await expect(getChannelWebhooksSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelWebhooksProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelWebhooksQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
