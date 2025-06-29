import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyWebhook,
  modifyWebhookProcedure,
  modifyWebhookSafe,
  modifyWebhookSchema
} from "../modifyWebhook.js";
import { webhookSchema } from "../types/Webhook.js";

describe(`modifyWebhook`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.patch(
    `/webhooks/:webhook`,
    modifyWebhookSchema,
    webhookSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyWebhookSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(modifyWebhookProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
