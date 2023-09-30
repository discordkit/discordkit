import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteWebhook,
  deleteWebhookProcedure,
  deleteWebhookSafe,
  deleteWebhookSchema
} from "../deleteWebhook";

describe(`deleteWebhook`, () => {
  mockRequest.delete(`/webhooks/:webhook`);
  const config = generateMock(deleteWebhookSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteWebhookSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteWebhookProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
