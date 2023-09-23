import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";
import {
  getChannelWebhooksQuery,
  getChannelWebhooksSchema
} from "../getChannelWebhooks";

describe(`getChannelWebhooks`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/webhooks`,
    webhookSchema.array()
  );
  const config = generateMock(getChannelWebhooksSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getChannelWebhooks(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getChannelWebhooksQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
