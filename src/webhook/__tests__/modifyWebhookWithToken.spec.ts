import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { webhookSchema } from "../types";
import {
  modifyWebhookWithToken,
  modifyWebhookWithTokenSchema
} from "../modifyWebhookWithToken";

describe(`modifyWebhookWithToken`, () => {
  const expected = mockRequest.patch(
    `/webhooks/:webhook/:token`,
    webhookSchema
  );
  const config = generateMock(modifyWebhookWithTokenSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyWebhookWithToken(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyWebhookWithToken);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
