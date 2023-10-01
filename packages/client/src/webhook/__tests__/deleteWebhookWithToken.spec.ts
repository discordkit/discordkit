import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteWebhookWithToken,
  deleteWebhookWithTokenProcedure,
  deleteWebhookWithTokenSafe,
  deleteWebhookWithTokenSchema
} from "../deleteWebhookWithToken.ts";

describe(`deleteWebhookWithToken`, () => {
  mockRequest.delete(`/webhooks/:webhook/:token`);
  const config = generateMock(deleteWebhookWithTokenSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteWebhookWithTokenSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteWebhookWithTokenProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteWebhookWithToken);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
