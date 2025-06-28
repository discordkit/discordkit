import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { omit } from "valibot";
import {
  modifyWebhookWithToken,
  modifyWebhookWithTokenProcedure,
  modifyWebhookWithTokenSafe,
  modifyWebhookWithTokenSchema
} from "../modifyWebhookWithToken.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`modifyWebhookWithToken`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook/:token`,
    modifyWebhookWithTokenSchema,
    omit(webhookSchema, [`user`])
  );

  it(`can be used standalone`, async () => {
    await expect(modifyWebhookWithTokenSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyWebhookWithTokenProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyWebhookWithToken);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
