import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getChannelWebhooksProcedure,
  getChannelWebhooksQuery,
  getChannelWebhooksSchema
} from "../getChannelWebhooks";
import { webhookSchema } from "../types/Webhook";

describe(`getChannelWebhooks`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/webhooks`,
    webhookSchema.array()
  );
  const config = generateMock(getChannelWebhooksSchema);

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
