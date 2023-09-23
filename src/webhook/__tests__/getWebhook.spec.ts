import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";
import { getWebhookQuery, getWebhookSchema } from "../getWebhook";

describe(`getWebhook`, () => {
  const expected = mockRequest.get(`/webhooks/:webhook`, webhookSchema);
  const config = generateMock(getWebhookSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getWebhook(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getWebhookQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
