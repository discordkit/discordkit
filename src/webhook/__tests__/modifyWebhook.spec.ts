import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";
import { modifyWebhook, modifyWebhookSchema } from "../modifyWebhook";

describe(`modifyWebhook`, () => {
  const expected = mockRequest.patch(`/webhooks/:webhook`, webhookSchema);
  const config = generateMock(modifyWebhookSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyWebhook(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
