import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  executeWebhook,
  executeWebhookProcedure,
  executeWebhookSafe,
  executeWebhookSchema
} from "../executeWebhook.ts";

describe(`executeWebhook`, () => {
  mockRequest.post(`/webhooks/:webhook/:token`);
  const config = generateMock(executeWebhookSchema);

  it(`can be used standalone`, async () => {
    await expect(executeWebhookSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(executeWebhookProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(executeWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
