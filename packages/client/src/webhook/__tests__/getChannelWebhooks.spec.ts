import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getChannelWebhooksProcedure,
  getChannelWebhooksQuery,
  getChannelWebhooksSafe,
  getChannelWebhooksSchema
} from "../getChannelWebhooks.ts";
import { webhookSchema } from "../types/Webhook.ts";

describe(`getChannelWebhooks`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/webhooks`,
    webhookSchema.array().length(1)
  );
  const config = generateMock(getChannelWebhooksSchema);

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
