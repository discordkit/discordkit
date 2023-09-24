import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createWebhook,
  createWebhookProcedure,
  createWebhookSchema
} from "../createWebhook";
import { webhookSchema } from "../types/Webhook";

describe(`createWebhook`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/webhooks`,
    webhookSchema
  );
  const config = generateMock(createWebhookSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createWebhookProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
