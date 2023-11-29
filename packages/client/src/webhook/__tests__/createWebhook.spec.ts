import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createWebhook,
  createWebhookProcedure,
  createWebhookSafe,
  createWebhookSchema
} from "../createWebhook.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`createWebhook`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/webhooks`,
    webhookSchema
  );
  const config = mockSchema(createWebhookSchema);

  it(`can be used standalone`, async () => {
    await expect(createWebhookSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(createWebhookProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
