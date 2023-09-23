import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { messageSchema } from "../../channel";
import { client } from "../__fixtures__/router";
import {
  getWebhookMessageQuery,
  getWebhookMessageSchema
} from "../getWebhookMessage";

describe(`getWebhookMessage`, () => {
  const expected = mockRequest.get(
    `/webhooks/:webhook/:token/messages/:message`,
    messageSchema
  );
  const config = generateMock(getWebhookMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getWebhookMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getWebhookMessageQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
