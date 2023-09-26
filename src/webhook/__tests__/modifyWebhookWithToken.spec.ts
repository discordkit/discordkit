import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyWebhookWithToken,
  modifyWebhookWithTokenProcedure,
  modifyWebhookWithTokenSchema
} from "../modifyWebhookWithToken";
import { webhookSchema } from "../types/Webhook";

describe(`modifyWebhookWithToken`, () => {
  const expected = mockRequest.patch(
    `/webhooks/:webhook/:token`,
    webhookSchema.omit({ user: true })
  );
  const config = generateMock(modifyWebhookWithTokenSchema);

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
