import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";
import {
  getWebhookWithTokenQuery,
  getWebhookWithTokenSchema
} from "../getWebhookWithToken";

describe(`getWebhookWithToken`, () => {
  const expected = mockRequest.get(`/webhooks/:webhook/:token`, webhookSchema);
  const config = generateMock(getWebhookWithTokenSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getWebhookWithToken(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getWebhookWithTokenQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
