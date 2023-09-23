import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";
import { createWebhook, createWebhookSchema } from "../createWebhook";

describe(`createWebhook`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/webhooks`,
    webhookSchema
  );
  const config = generateMock(createWebhookSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createWebhook(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createWebhook);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
