import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  executeWebhook,
  executeWebhookProcedure,
  executeWebhookSafe,
  executeWebhookSchema
} from "../executeWebhook.js";

describe(`executeWebhook`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:webhook/:token`,
    executeWebhookSchema
  );

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
