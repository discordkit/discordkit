import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { messageSchema } from "../../channel";
import { client } from "../__fixtures__/router";
import {
  editWebhookMessage,
  editWebhookMessageSchema
} from "../editWebhookMessage";

describe(`editWebhookMessage`, () => {
  const expected = mockRequest.patch(
    `/webhooks/:webhook/:token/messages/:message`,
    messageSchema
  );
  const config = generateMock(editWebhookMessageSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.editWebhookMessage(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(editWebhookMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
