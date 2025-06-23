import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  executeWebhook,
  executeWebhookProcedure,
  executeWebhookSafe,
  executeWebhookSchema
} from "../executeWebhook.js";

describe(`executeWebhook`, () => {
  mockRequest.post(`/webhooks/:webhook/:token`);
  const config = mockSchema(executeWebhookSchema);

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
