import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyWebhook,
  modifyWebhookProcedure,
  modifyWebhookSafe,
  modifyWebhookSchema
} from "../modifyWebhook.ts";
import { webhookSchema } from "../types/Webhook.ts";

describe(`modifyWebhook`, () => {
  const expected = mockRequest.patch(`/webhooks/:webhook`, webhookSchema);
  const config = generateMock(modifyWebhookSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyWebhookSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyWebhookProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
