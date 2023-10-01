import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  modifyWebhookWithToken,
  modifyWebhookWithTokenProcedure,
  modifyWebhookWithTokenSafe,
  modifyWebhookWithTokenSchema
} from "../modifyWebhookWithToken.ts";
import { webhookSchema } from "../types/Webhook.ts";

describe(`modifyWebhookWithToken`, () => {
  const expected = mockRequest.patch(
    `/webhooks/:webhook/:token`,
    webhookSchema.omit({ user: true })
  );
  const config = generateMock(modifyWebhookWithTokenSchema);

  it(`can be used standalone`, async () => {
    await expect(modifyWebhookWithTokenSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyWebhookWithTokenProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyWebhookWithToken);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});