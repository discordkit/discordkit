import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyWebhook,
  modifyWebhookProcedure,
  modifyWebhookSchema
} from "../modifyWebhook";
import { webhookSchema } from "../types/Webhook";

describe(`modifyWebhook`, () => {
  const expected = mockRequest.patch(`/webhooks/:webhook`, webhookSchema);
  const config = generateMock(modifyWebhookSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyWebhookProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
