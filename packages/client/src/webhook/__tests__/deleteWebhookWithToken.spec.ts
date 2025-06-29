import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteWebhookWithToken,
  deleteWebhookWithTokenProcedure,
  deleteWebhookWithTokenSafe,
  deleteWebhookWithTokenSchema
} from "../deleteWebhookWithToken.js";

describe(`deleteWebhookWithToken`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/webhooks/:webhook/:token`,
    deleteWebhookWithTokenSchema
  );

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
