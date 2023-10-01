import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  executeSlackCompatibleWebhook,
  executeSlackCompatibleWebhookProcedure,
  executeSlackCompatibleWebhookSafe,
  executeSlackCompatibleWebhookSchema
} from "../executeSlackCompatibleWebhook.ts";

describe(`executeSlackCompatibleWebhook`, () => {
  mockRequest.post(`/webhooks/:webhook/:token/slack`);
  const config = generateMock(executeSlackCompatibleWebhookSchema);

  it(`can be used standalone`, async () => {
    await expect(
      executeSlackCompatibleWebhookSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(executeSlackCompatibleWebhookProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(executeSlackCompatibleWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
