import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  executeSlackCompatibleWebhook,
  executeSlackCompatibleWebhookProcedure,
  executeSlackCompatibleWebhookSafe,
  executeSlackCompatibleWebhookSchema
} from "../executeSlackCompatibleWebhook.js";

describe(`executeSlackCompatibleWebhook`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:webhook/:token/slack`,
    executeSlackCompatibleWebhookSchema
  );

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
